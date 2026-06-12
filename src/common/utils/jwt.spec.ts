import { describe, it, expect } from "vitest";
import { createAccessToken, verifyToken, generateRefreshToken, parseRefreshTokenUserId } from "./jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";

describe("jwt.util", () => {
    it("crea y verifica un access token con su payload", async () => {
        const token = await createAccessToken({ id: "u1", email: "a@a.com", role: "user" });
        const payload = await verifyToken(token);
        expect(payload.id).toBe("u1");
        expect(payload.email).toBe("a@a.com");
        expect(payload.role).toBe("user");
    });

    it("rechaza tokens inválidos", async () => {
        await expect(verifyToken("no.es.un.token")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("genera refresh token con prefijo de userId y expiración futura", () => {
        const { token, expiresAt } = generateRefreshToken("u1");
        expect(parseRefreshTokenUserId(token)).toBe("u1");
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("parseRefreshTokenUserId devuelve null si no hay prefijo", () => {
        expect(parseRefreshTokenUserId("sin-prefijo")).toBeNull();
    });
});
