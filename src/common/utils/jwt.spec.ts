import { describe, it, expect } from "vitest";
import { createAccessToken, verifyAccessToken, createRefreshToken, verifyRefreshToken } from "./jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";

describe("jwt.util", () => {
    it("crea y verifica un access token con su payload", async () => {
        const token = await createAccessToken({ id: "u1", email: "a@a.com", role: "user" });
        const payload = await verifyAccessToken(token);
        expect(payload.id).toBe("u1");
        expect(payload.email).toBe("a@a.com");
        expect(payload.role).toBe("user");
    });

    it("rechaza access tokens inválidos", async () => {
        await expect(verifyAccessToken("no.es.un.token")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("crea y verifica un refresh token con el userId en sub y expiración futura", async () => {
        const { token, expiresAt } = await createRefreshToken("u1");
        const { userId } = await verifyRefreshToken(token);
        expect(userId).toBe("u1");
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("rechaza refresh tokens inválidos", async () => {
        await expect(verifyRefreshToken("no.es.un.token")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("los secretos son independientes: un access token no sirve como refresh (ni al revés)", async () => {
        const access = await createAccessToken({ id: "u1", email: "a@a.com", role: "user" });
        await expect(verifyRefreshToken(access)).rejects.toBeInstanceOf(UnauthorizedException);

        const { token: refresh } = await createRefreshToken("u1");
        await expect(verifyAccessToken(refresh)).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
