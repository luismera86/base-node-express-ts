import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import envConfig from "../../config/env.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

const secret = new TextEncoder().encode(envConfig.JWT_SECRET);

/**
 * Access token JWT de vida corta (por defecto 15m). Se usa en la cabecera Authorization.
 */
export const createAccessToken = async (payload: Record<string, unknown>): Promise<string> => {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(envConfig.JWT_ACCESS_EXPIRES)
        .sign(secret);
};

export const verifyToken = async (token: string): Promise<{ id: string; email: string; role: string }> => {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as { id: string; email: string; role: string };
    } catch {
        throw new UnauthorizedException("Token inválido o expirado");
    }
};

/**
 * Refresh token opaco (no JWT): aleatorio y revocable. Lleva el id de usuario como
 * prefijo (`<userId>:<random>`) para poder localizar al dueño sin exponer el secreto.
 * Se devuelve en claro al cliente y se persiste hasheado en la BD para poder
 * invalidarlo (logout / reset / rotación).
 */
export const generateRefreshToken = (userId: string): { token: string; expiresAt: Date } => {
    const token = `${userId}:${randomUUID()}.${randomUUID()}`;
    const days = Number(envConfig.JWT_REFRESH_EXPIRES_DAYS);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return { token, expiresAt };
};

/** Extrae el id de usuario del prefijo de un refresh token. */
export const parseRefreshTokenUserId = (token: string): string | null => {
    const idx = token.indexOf(":");
    return idx > 0 ? token.slice(0, idx) : null;
};
