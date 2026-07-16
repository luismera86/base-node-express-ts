import { Response } from "express";
import ms, { StringValue } from "ms";
import envConfig from "../../config/env.config";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

// El refresh (larga vida) solo viaja al único endpoint que lo necesita.
const REFRESH_COOKIE_PATH = "/api/v1/auth/refresh";

const baseOptions = {
    httpOnly: true, // el JS del navegador no puede leerlas (mitiga robo por XSS)
    sameSite: "lax" as const, // no viajan en peticiones cross-site (mitiga CSRF)
    secure: envConfig.COOKIE_SECURE, // solo HTTPS; activo en producción por defecto
};

/**
 * Entrega el par de tokens en cookies httpOnly. Nunca en el body: si viajaran
 * en la respuesta, un XSS podría llamar a /refresh (la cookie viaja sola) y
 * leer tokens frescos, anulando el beneficio de httpOnly.
 */
export const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
        ...baseOptions,
        path: "/",
        maxAge: ms(envConfig.JWT_ACCESS_EXPIRES as StringValue),
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
        ...baseOptions,
        path: REFRESH_COOKIE_PATH,
        maxAge: envConfig.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: REFRESH_COOKIE_PATH });
};
