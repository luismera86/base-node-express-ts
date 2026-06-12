import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import envConfig from "../../config/env.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

const secreto = new TextEncoder().encode(envConfig.JWT_SECRET);

/**
 * Access token JWT de vida corta (por defecto 15m). Se usa en la cabecera Authorization.
 */
export const crearTokenAcceso = async (payload: Record<string, unknown>): Promise<string> => {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(envConfig.JWT_ACCESS_EXPIRES)
        .sign(secreto);
};

export const verificarToken = async (token: string): Promise<{ id: string; correo: string; rol: string }> => {
    try {
        const { payload } = await jwtVerify(token, secreto);
        return payload as { id: string; correo: string; rol: string };
    } catch {
        throw new UnauthorizedException("Token inválido o expirado");
    }
};

/**
 * Refresh token opaco (no JWT): aleatorio y revocable. Lleva el id de usuario como
 * prefijo (`<idUsuario>:<aleatorio>`) para poder localizar al dueño sin exponer el secreto.
 * Se devuelve en claro al cliente y se persiste hasheado en la BD para poder
 * invalidarlo (cerrar sesión / restablecer / rotación).
 */
export const generarTokenRefresco = (idUsuario: string): { token: string; expiraEn: Date } => {
    const token = `${idUsuario}:${randomUUID()}.${randomUUID()}`;
    const dias = Number(envConfig.JWT_REFRESH_EXPIRES_DAYS);
    const expiraEn = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    return { token, expiraEn };
};

/** Extrae el id de usuario del prefijo de un refresh token. */
export const extraerIdUsuarioDeTokenRefresco = (token: string): string | null => {
    const idx = token.indexOf(":");
    return idx > 0 ? token.slice(0, idx) : null;
};
