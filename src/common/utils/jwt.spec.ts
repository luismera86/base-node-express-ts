import { describe, it, expect } from "vitest";
import { crearTokenAcceso, verificarToken, generarTokenRefresco, extraerIdUsuarioDeTokenRefresco } from "./jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";

describe("jwt.util", () => {
    it("crea y verifica un access token con su payload", async () => {
        const token = await crearTokenAcceso({ id: "u1", correo: "a@a.com", rol: "user" });
        const payload = await verificarToken(token);
        expect(payload.id).toBe("u1");
        expect(payload.correo).toBe("a@a.com");
        expect(payload.rol).toBe("user");
    });

    it("rechaza tokens inválidos", async () => {
        await expect(verificarToken("no.es.un.token")).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("genera refresh token con prefijo de idUsuario y expiración futura", () => {
        const { token, expiraEn } = generarTokenRefresco("u1");
        expect(extraerIdUsuarioDeTokenRefresco(token)).toBe("u1");
        expect(expiraEn.getTime()).toBeGreaterThan(Date.now());
    });

    it("extraerIdUsuarioDeTokenRefresco devuelve null si no hay prefijo", () => {
        expect(extraerIdUsuarioDeTokenRefresco("sin-prefijo")).toBeNull();
    });
});
