import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";

vi.mock("../src/common/mail/mailer.util", () => ({
    sendMail: vi.fn(async () => {}),
}));

import { createApp } from "../src/config/server.config";
import { prisma } from "../src/config/prisma.config";
import { hashPassword } from "../src/common/utils/hash.util";

const app = createApp();

const ADMIN_EMAIL = "e2e-admin@test.com";
const USER_EMAIL = "e2e-user@test.com";
const PASSWORD = "Secret1234!";

const loginCookie = async (email: string): Promise<string> => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
    const cookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
    return cookies.find((c) => c.startsWith("access_token="))!.split(";")[0];
};

describe("user e2e (RBAC + paginación)", () => {
    beforeAll(async () => {
        // Los usuarios de prueba se crean directo en la DB (verificados).
        const password = await hashPassword(PASSWORD);
        await prisma.user.createMany({
            data: [
                {
                    first_name: "Admin",
                    last_name: "E2E",
                    email: ADMIN_EMAIL,
                    password,
                    role: "admin",
                    email_verified: true,
                },
                ...Array.from({ length: 7 }, (_, i) => ({
                    first_name: `User${i}`,
                    last_name: "E2E",
                    email: i === 0 ? USER_EMAIL : `e2e-user-${i}@test.com`,
                    password,
                    role: "user",
                    email_verified: true,
                })),
            ],
            skipDuplicates: true,
        });
    });

    it("GET /user exige autenticación (401) y rol admin (403)", async () => {
        const anonymous = await request(app).get("/api/v1/user");
        expect(anonymous.status).toBe(401);

        const userCookie = await loginCookie(USER_EMAIL);
        const forbidden = await request(app).get("/api/v1/user").set("Cookie", userCookie);
        expect(forbidden.status).toBe(403);
    });

    it("GET /user devuelve la respuesta paginada estándar", async () => {
        const adminCookie = await loginCookie(ADMIN_EMAIL);

        const res = await request(app).get("/api/v1/user?page=1&limit=5&order=asc").set("Cookie", adminCookie);
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ page: 1, limit: 5, total: expect.any(Number), pages: expect.any(Number) });
        expect(res.body.items.length).toBeLessThanOrEqual(5);
        expect(res.body.pages).toBe(Math.ceil(res.body.total / 5));
        // Sin campos sensibles en el listado.
        for (const item of res.body.items) {
            expect(item).not.toHaveProperty("password");
            expect(item).not.toHaveProperty("refresh_token_hash");
        }

        // La página 2 no repite elementos de la página 1.
        const page2 = await request(app).get("/api/v1/user?page=2&limit=5&order=asc").set("Cookie", adminCookie);
        expect(page2.status).toBe(200);
        const idsPage1 = new Set(res.body.items.map((u: { id: string }) => u.id));
        for (const item of page2.body.items) expect(idsPage1.has(item.id)).toBe(false);
    });

    it("valida los parámetros de paginación (limit tope 100)", async () => {
        const adminCookie = await loginCookie(ADMIN_EMAIL);
        const res = await request(app).get("/api/v1/user?limit=1000").set("Cookie", adminCookie);
        expect(res.status).toBe(400);
    });

    it("un usuario no puede leer el recurso de otro (anti-IDOR), un admin sí", async () => {
        const other = await prisma.user.findFirst({ where: { email: "e2e-user-1@test.com" } });
        const userCookie = await loginCookie(USER_EMAIL);
        const adminCookie = await loginCookie(ADMIN_EMAIL);

        const forbidden = await request(app).get(`/api/v1/user/${other!.id}`).set("Cookie", userCookie);
        expect(forbidden.status).toBe(403);

        const allowed = await request(app).get(`/api/v1/user/${other!.id}`).set("Cookie", adminCookie);
        expect(allowed.status).toBe(200);
    });

    it("un no-admin no puede escalar privilegios editándose (mass-assignment)", async () => {
        const me = await prisma.user.findFirst({ where: { email: USER_EMAIL } });
        const userCookie = await loginCookie(USER_EMAIL);

        const res = await request(app)
            .patch(`/api/v1/user/${me!.id}`)
            .set("Cookie", userCookie)
            .send({ first_name: "Cambiado", role: "admin" });
        expect(res.status).toBe(200);

        const after = await prisma.user.findFirst({ where: { id: me!.id } });
        expect(after!.first_name).toBe("Cambiado");
        expect(after!.role).toBe("user");
    });
});
