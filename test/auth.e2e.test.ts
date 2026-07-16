import { describe, it, expect, vi, type Mock } from "vitest";
import request from "supertest";

// Único efecto externo mockeado: el envío de correos. Capturamos las llamadas
// para extraer los tokens de verificación / reset de los enlaces.
vi.mock("../src/modules/mail/utils/mailer.util", () => ({
    sendMail: vi.fn(async () => {}),
}));

import { createApp } from "../src/config/server.config";
import { sendMail } from "../src/modules/mail/utils/mailer.util";

const app = createApp();

const EMAIL = "e2e-auth@test.com";
const PASSWORD = "Secret1234!";
const NEW_PASSWORD = "NewSecret1234!";

/** Extrae el token del último mail enviado (enlace `?token=<hex>`). */
const lastMailToken = (): string => {
    const calls = (sendMail as Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const content = calls[calls.length - 1][1] as { text: string };
    const match = content.text.match(/token=([a-f0-9]{64})/);
    expect(match).not.toBeNull();
    return match![1];
};

const cookiesOf = (res: request.Response): string[] => (res.headers["set-cookie"] as unknown as string[]) ?? [];

const cookiePair = (cookies: string[], name: string): string | undefined =>
    cookies.find((c) => c.startsWith(`${name}=`))?.split(";")[0];

describe("auth e2e (HTTP + DB reales)", () => {
    it("GET /health responde ok con la DB arriba", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok", database: "up" });
    });

    it("rechaza el registro con contraseña débil (400, mensaje traducido)", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({ first_name: "E2E", last_name: "Test", email: EMAIL, password: "debilsinreglas" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Error de validación");
    });

    it("registra al usuario, envía el mail de verificación y NO inicia sesión", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({ first_name: "E2E", last_name: "Test", email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ email: EMAIL });
        expect(res.body).not.toHaveProperty("password");
        expect(cookiesOf(res)).toHaveLength(0);
        expect(sendMail).toHaveBeenCalledWith(EMAIL, expect.objectContaining({ subject: expect.any(String) }));
    });

    it("bloquea el login (403) mientras el correo no esté verificado", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(403);
    });

    it("mismo 401 con email inexistente que con contraseña incorrecta (anti-enumeración)", async () => {
        const ghost = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "no-existe@test.com", password: PASSWORD });
        const wrongPass = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: EMAIL, password: "Incorrecta1!" });
        expect(ghost.status).toBe(401);
        expect(wrongPass.status).toBe(401);
        expect(ghost.body.message).toBe(wrongPass.body.message);
    });

    it("rechaza un token de verificación inválido (400)", async () => {
        const res = await request(app)
            .post("/api/v1/auth/verify-email")
            .send({ token: "0".repeat(64) });
        expect(res.status).toBe(400);
    });

    let verificationToken: string;

    it("verifica el correo con el token del mail (204) y el token es de un solo uso", async () => {
        verificationToken = lastMailToken();
        const ok = await request(app).post("/api/v1/auth/verify-email").send({ token: verificationToken });
        expect(ok.status).toBe(204);

        const reuse = await request(app).post("/api/v1/auth/verify-email").send({ token: verificationToken });
        expect(reuse.status).toBe(400);
    });

    it("resend-verification responde 204 siempre (exista o no, verificado o no)", async () => {
        const verified = await request(app).post("/api/v1/auth/resend-verification").send({ email: EMAIL });
        const ghost = await request(app).post("/api/v1/auth/resend-verification").send({ email: "no-existe@test.com" });
        expect(verified.status).toBe(204);
        expect(ghost.status).toBe(204);
    });

    let accessCookie: string;
    let refreshCookie: string;

    it("login: setea cookies httpOnly y no devuelve tokens en el body", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: PASSWORD });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ user: { id: expect.any(String), email: EMAIL, role: "user" } });
        expect(JSON.stringify(res.body)).not.toContain("token");

        const cookies = cookiesOf(res);
        const access = cookies.find((c) => c.startsWith("access_token="));
        const refresh = cookies.find((c) => c.startsWith("refresh_token="));
        expect(access).toContain("HttpOnly");
        expect(access).toContain("SameSite=Lax");
        expect(access).toContain("Path=/");
        expect(refresh).toContain("HttpOnly");
        // El refresh (larga vida) solo viaja al endpoint que lo necesita.
        expect(refresh).toContain("Path=/api/v1/auth/refresh");

        accessCookie = cookiePair(cookies, "access_token")!;
        refreshCookie = cookiePair(cookies, "refresh_token")!;
    });

    it("accede a una ruta protegida usando solo la cookie (y sin campos sensibles)", async () => {
        const login = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: PASSWORD });
        const userId = login.body.user.id;
        accessCookie = cookiePair(cookiesOf(login), "access_token")!;
        refreshCookie = cookiePair(cookiesOf(login), "refresh_token")!;

        const res = await request(app).get(`/api/v1/user/${userId}`).set("Cookie", accessCookie);
        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty("password");
        expect(res.body).not.toHaveProperty("refresh_token_hash");
    });

    it("sin credenciales una ruta protegida responde 401", async () => {
        const res = await request(app).get("/api/v1/user/00000000-0000-0000-0000-000000000000");
        expect(res.status).toBe(401);
    });

    it("refresh rota el par y detecta el reuso revocando la sesión completa", async () => {
        // Rotación: la cookie de refresh emite un par nuevo.
        const rotated = await request(app).post("/api/v1/auth/refresh").set("Cookie", refreshCookie);
        expect(rotated.status).toBe(200);
        const newRefreshCookie = cookiePair(cookiesOf(rotated), "refresh_token")!;
        expect(newRefreshCookie).not.toBe(refreshCookie);

        // Reuso del refresh viejo (fallback por body) → 401...
        const oldToken = refreshCookie.split("=").slice(1).join("=");
        const reuse = await request(app).post("/api/v1/auth/refresh").send({ refresh_token: oldToken });
        expect(reuse.status).toBe(401);

        // ...y el refresh vigente también queda revocado (robo asumido).
        const current = await request(app).post("/api/v1/auth/refresh").set("Cookie", newRefreshCookie);
        expect(current.status).toBe(401);
    });

    it("forgot-password responde 204 siempre y el reset invalida las sesiones", async () => {
        const ghost = await request(app).post("/api/v1/auth/forgot-password").send({ email: "no-existe@test.com" });
        expect(ghost.status).toBe(204);

        const real = await request(app).post("/api/v1/auth/forgot-password").send({ email: EMAIL });
        expect(real.status).toBe(204);
        const resetToken = lastMailToken();

        // Política de contraseñas también en el reset.
        const weak = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ token: resetToken, new_password: "debil" });
        expect(weak.status).toBe(400);

        const ok = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ token: resetToken, new_password: NEW_PASSWORD });
        expect(ok.status).toBe(204);

        // Token de un solo uso.
        const reuse = await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ token: resetToken, new_password: NEW_PASSWORD });
        expect(reuse.status).toBe(400);

        // La contraseña vieja ya no sirve; la nueva sí.
        const oldPass = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: PASSWORD });
        expect(oldPass.status).toBe(401);
        const newPass = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: NEW_PASSWORD });
        expect(newPass.status).toBe(200);
    });

    it("logout revoca el refresh y limpia las cookies (204)", async () => {
        const login = await request(app).post("/api/v1/auth/login").send({ email: EMAIL, password: NEW_PASSWORD });
        const cookies = cookiesOf(login);
        const access = cookiePair(cookies, "access_token")!;
        const refresh = cookiePair(cookies, "refresh_token")!;

        const res = await request(app).post("/api/v1/auth/logout").set("Cookie", access);
        expect(res.status).toBe(204);
        const cleared = cookiesOf(res);
        expect(cleared.some((c) => c.startsWith("access_token=;"))).toBe(true);
        expect(cleared.some((c) => c.startsWith("refresh_token=;"))).toBe(true);

        // El refresh revocado ya no rota.
        const rotate = await request(app).post("/api/v1/auth/refresh").set("Cookie", refresh);
        expect(rotate.status).toBe(401);
    });

    it("los errores salen con formato uniforme, requestId e i18n por Accept-Language", async () => {
        const es = await request(app).get("/api/v1/no-existe");
        expect(es.status).toBe(404);
        expect(es.body).toMatchObject({
            statusCode: 404,
            error: "Not Found",
            message: "Ruta no encontrada",
            path: "/api/v1/no-existe",
        });
        expect(es.body.requestId).toBeTruthy();
        expect(es.headers["x-request-id"]).toBeTruthy();

        const en = await request(app).get("/api/v1/no-existe").set("Accept-Language", "en-US");
        expect(en.body.message).toBe("Path not found");
    });
});
