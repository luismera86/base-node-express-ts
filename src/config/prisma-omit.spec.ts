import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "./prisma.config";
import { hashPassword } from "../common/utils/hash.util";

// Verifica que el `omit` global nunca exponga campos sensibles. Requiere la BD levantada.
const email = `omit-test-${Date.now()}@example.com`;

describe("prisma global omit", () => {
    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email } });
        await prisma.$disconnect();
    });

    it("no expone password ni hashes de tokens al leer un usuario", async () => {
        await prisma.user.create({
            data: {
                first_name: "Omit",
                last_name: "Test",
                email,
                password: await hashPassword("Password123!"),
                // Rol base sembrado por la migración roles-table.
                role: { connect: { name: "user" } },
            },
        });

        const user = await prisma.user.findFirst({ where: { email } });
        expect(user).not.toBeNull();
        const serialized = JSON.parse(JSON.stringify(user));
        expect(serialized).not.toHaveProperty("password");
        expect(serialized).not.toHaveProperty("reset_token_hash");
        expect(serialized).not.toHaveProperty("reset_token_expires_at");
        expect(serialized).not.toHaveProperty("refresh_token_hash");
        expect(serialized).not.toHaveProperty("verification_token_hash");
        expect(serialized).not.toHaveProperty("verification_token_expires_at");
    });

    it("permite reactivar el campo con omit:false cuando se necesita el hash", async () => {
        const user = await prisma.user.findFirst({ where: { email }, omit: { password: false } });
        expect(user?.password).toBeTypeOf("string");
    });
});
