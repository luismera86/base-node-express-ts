import type { Socket } from "socket.io";
import { verifyAccessToken } from "../../../common/utils/jwt.util";
import { ACCESS_COOKIE } from "../../../common/utils/cookie.util";
import { UnauthorizedException } from "../../../exceptions/exceptions";

/** Usuario autenticado en el handshake (payload del access token, sin ir a la DB). */
export interface WsUser {
    id: string;
    email: string;
    role: string;
}

/**
 * cookie-parser es middleware HTTP y no corre en el handshake de socket.io,
 * así que la cabecera Cookie se parsea acá.
 */
const parseCookies = (header?: string): Record<string, string> => {
    if (!header) return {};

    return header.split(";").reduce<Record<string, string>>((cookies, pair) => {
        const separator = pair.indexOf("=");
        if (separator === -1) return cookies;

        const name = pair.slice(0, separator).trim();
        const value = pair.slice(separator + 1).trim();
        if (name) cookies[name] = decodeURIComponent(value);
        return cookies;
    }, {});
};

/**
 * Extracción cookie-first con fallbacks, mismo criterio que authUser:
 * navegadores usan la cookie httpOnly `access_token` (viaja sola con
 * `withCredentials`); clientes no-browser pueden mandar el token en
 * `io(url, { auth: { token } })` o en `Authorization: Bearer <token>`.
 */
const extractToken = (socket: Socket): string | null => {
    const fromCookie = parseCookies(socket.handshake.headers.cookie)[ACCESS_COOKIE];
    if (fromCookie) return fromCookie;

    const fromAuth = (socket.handshake.auth as Record<string, unknown>).token;
    if (typeof fromAuth === "string" && fromAuth.length > 0) return fromAuth;

    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);

    return null;
};

/**
 * Autentica el handshake verificando el access token (JWT de vida corta).
 * Lanza con clave i18n si falta o es inválido — el cliente la recibe como
 * mensaje del `connect_error`.
 */
export const authenticateSocket = async (socket: Socket): Promise<WsUser> => {
    const token = extractToken(socket);
    if (!token) throw new UnauthorizedException("errors.TOKEN_NOT_PROVIDED");

    const payload = await verifyAccessToken(token);
    return { id: payload.id, email: payload.email, role: payload.role };
};
