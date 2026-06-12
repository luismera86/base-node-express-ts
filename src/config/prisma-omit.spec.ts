import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "./prisma.config";
import { hashearContrasena } from "../common/utils/hash.util";

// Verifica que el `omit` global nunca exponga campos sensibles. Requiere la BD levantada.
const correo = `omit-test-${Date.now()}@example.com`;

describe("omit global de prisma", () => {
    afterAll(async () => {
        await prisma.usuario.deleteMany({ where: { correo } });
        await prisma.$disconnect();
    });

    it("no expone contrasena/token_recuperacion/token_refresco al leer un usuario", async () => {
        await prisma.usuario.create({
            data: {
                nombre: "Omit",
                apellido: "Test",
                correo,
                contrasena: await hashearContrasena("Password123!"),
            },
        });

        const usuario = await prisma.usuario.findFirst({ where: { correo } });
        expect(usuario).not.toBeNull();
        const serializado = JSON.parse(JSON.stringify(usuario));
        expect(serializado).not.toHaveProperty("contrasena");
        expect(serializado).not.toHaveProperty("token_recuperacion");
        expect(serializado).not.toHaveProperty("token_recuperacion_expira_en");
        expect(serializado).not.toHaveProperty("token_refresco");
        expect(serializado).not.toHaveProperty("token_refresco_expira_en");
    });

    it("permite reactivar el campo con omit:false cuando se necesita el hash", async () => {
        const usuario = await prisma.usuario.findFirst({ where: { correo }, omit: { contrasena: false } });
        expect(usuario?.contrasena).toBeTypeOf("string");
    });
});
