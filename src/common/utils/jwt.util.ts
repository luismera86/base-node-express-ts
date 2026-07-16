import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import envConfig from "../../config/env.config";
import { UnauthorizedException } from "../../exceptions/exceptions";

// Secretos separados: un access token robado no sirve para forjar refresh tokens (y viceversa).
const accessSecret = new TextEncoder().encode(envConfig.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(envConfig.JWT_REFRESH_SECRET);

/**
 * Access token JWT de vida corta (por defecto 15m). Viaja en cookie httpOnly
 * `access_token` o, como fallback para clientes API, en la cabecera Authorization.
 */
export const createAccessToken = async (payload: Record<string, unknown>): Promise<string> => {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(envConfig.JWT_ACCESS_EXPIRES)
        .sign(accessSecret);
};

export const verifyAccessToken = async (token: string): Promise<{ id: string; email: string; role: string }> => {
    try {
        const { payload } = await jwtVerify(token, accessSecret);
        return payload as { id: string; email: string; role: string };
    } catch {
        throw new UnauthorizedException("errors.INVALID_OR_EXPIRED_TOKEN");
    }
};

/**
 * Refresh token JWT de vida larga firmado con su propio secreto. Se entrega en
 * la cookie httpOnly `refresh_token` (path restringido al endpoint de refresh)
 * y en la BD solo se persiste su hash SHA-256 — nunca el token en claro — para
 * poder rotarlo, revocarlo y detectar reuso.
 */
export const createRefreshToken = async (userId: string): Promise<{ token: string; expiresAt: Date }> => {
    const expiresAt = new Date(Date.now() + envConfig.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    const token = await new SignJWT({ sub: userId, jti: randomUUID() })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(refreshSecret);
    return { token, expiresAt };
};

/** Verifica firma y expiración del refresh token y devuelve el id de usuario. */
export const verifyRefreshToken = async (token: string): Promise<{ userId: string }> => {
    try {
        const { payload } = await jwtVerify(token, refreshSecret);
        if (!payload.sub) throw new Error("missing sub");
        return { userId: payload.sub };
    } catch {
        throw new UnauthorizedException("errors.INVALID_OR_EXPIRED_TOKEN");
    }
};
