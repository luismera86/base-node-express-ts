import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/config/server.config";
import { prisma } from "../src/config/prisma.config";
import { hashPassword } from "../src/common/utils/hash.util";

const app = createApp();

const ADMIN_EMAIL = "e2e-role-admin@test.com";
const USER_EMAIL = "e2e-role-user@test.com";
const PASSWORD = "Secret1234!";

const loginCookie = async (email: string): Promise<string> => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
    const cookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
    return cookies.find((c) => c.startsWith("access_token="))!.split(";")[0];
};

describe("role e2e (CRUD + protecciones)", () => {
    let adminCookie: string;
    let userCookie: string;

    beforeAll(async () => {
        // La tabla roles no se trunca entre corridas: se limpian los roles de prueba.
        await prisma.role.deleteMany({ where: { name: { notIn: ["admin", "user"] } } });

        const password = await hashPassword(PASSWORD);
        const roles = await prisma.role.findMany({ where: { name: { in: ["admin", "user"] } } });
        const roleId = Object.fromEntries(roles.map((r) => [r.name, r.id]));

        await prisma.user.createMany({
            data: [
                {
                    first_name: "Admin",
                    last_name: "Role",
                    email: ADMIN_EMAIL,
                    password,
                    role_id: roleId.admin,
                    email_verified: true,
                },
                {
                    first_name: "User",
                    last_name: "Role",
                    email: USER_EMAIL,
                    password,
                    role_id: roleId.user,
                    email_verified: true,
                },
            ],
            skipDuplicates: true,
        });

        adminCookie = await loginCookie(ADMIN_EMAIL);
        userCookie = await loginCookie(USER_EMAIL);
    });

    it("los roles base existen (sembrados por la migración)", async () => {
        const res = await request(app).get("/api/v1/role?limit=100").set("Cookie", adminCookie);
        expect(res.status).toBe(200);
        const names = res.body.items.map((r: { name: string }) => r.name);
        expect(names).toContain("admin");
        expect(names).toContain("user");
        // Cada rol expone cuántos usuarios lo tienen asignado.
        expect(res.body.items[0]._count).toHaveProperty("users");
    });

    it("exige autenticación (401) y rol admin (403)", async () => {
        expect((await request(app).get("/api/v1/role")).status).toBe(401);
        expect((await request(app).get("/api/v1/role").set("Cookie", userCookie)).status).toBe(403);
        expect(
            (await request(app).post("/api/v1/role").set("Cookie", userCookie).send({ name: "hacker" })).status,
        ).toBe(403);
    });

    it("crea un rol, lo normaliza a minúsculas y rechaza el nombre duplicado (409)", async () => {
        const created = await request(app)
            .post("/api/v1/role")
            .set("Cookie", adminCookie)
            .send({ name: "  Editor ", description: "Puede editar contenido" });
        expect(created.status).toBe(201);
        expect(created.body.name).toBe("editor");

        const duplicated = await request(app).post("/api/v1/role").set("Cookie", adminCookie).send({ name: "editor" });
        expect(duplicated.status).toBe(409);
    });

    it("asigna un rol de la tabla al crear un usuario y 404 con un rol inexistente", async () => {
        const created = await request(app).post("/api/v1/user").set("Cookie", adminCookie).send({
            first_name: "Con",
            last_name: "Editor",
            email: "e2e-role-editor@test.com",
            password: PASSWORD,
            role: "editor",
        });
        expect(created.status).toBe(201);
        expect(created.body.role.name).toBe("editor");

        const unknownRole = await request(app).post("/api/v1/user").set("Cookie", adminCookie).send({
            first_name: "Sin",
            last_name: "Rol",
            email: "e2e-role-none@test.com",
            password: PASSWORD,
            role: "no-existe",
        });
        expect(unknownRole.status).toBe(404);
    });

    it("actualiza un rol, pero no permite renombrar los roles base (400)", async () => {
        const editor = await prisma.role.findFirst({ where: { name: "editor" } });
        const updated = await request(app)
            .patch(`/api/v1/role/${editor!.id}`)
            .set("Cookie", adminCookie)
            .send({ description: "Actualizado" });
        expect(updated.status).toBe(200);
        expect(updated.body.description).toBe("Actualizado");

        const admin = await prisma.role.findFirst({ where: { name: "admin" } });
        const renamed = await request(app)
            .patch(`/api/v1/role/${admin!.id}`)
            .set("Cookie", adminCookie)
            .send({ name: "super-admin" });
        expect(renamed.status).toBe(400);
    });

    it("no elimina un rol con usuarios (409) ni un rol base (400); sin usuarios lo elimina", async () => {
        const editor = await prisma.role.findFirst({ where: { name: "editor" } });
        const inUse = await request(app).delete(`/api/v1/role/${editor!.id}`).set("Cookie", adminCookie);
        expect(inUse.status).toBe(409);

        const admin = await prisma.role.findFirst({ where: { name: "admin" } });
        const protectedRole = await request(app).delete(`/api/v1/role/${admin!.id}`).set("Cookie", adminCookie);
        expect(protectedRole.status).toBe(400);

        // Sin usuarios asignados sí se elimina (soft delete) y deja de listarse.
        await prisma.user.deleteMany({ where: { email: "e2e-role-editor@test.com" } });
        const deleted = await request(app).delete(`/api/v1/role/${editor!.id}`).set("Cookie", adminCookie);
        expect(deleted.status).toBe(200);

        const gone = await request(app).get(`/api/v1/role/${editor!.id}`).set("Cookie", adminCookie);
        expect(gone.status).toBe(404);
    });
});
