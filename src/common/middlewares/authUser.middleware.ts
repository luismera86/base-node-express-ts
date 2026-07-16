import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { ACCESS_COOKIE } from "../utils/cookie.util";
import { UnauthorizedException } from "../../exceptions/exceptions";
import { prisma } from "../../config/prisma.config";

/**
 * Extracción cookie-first con fallback Bearer: los navegadores usan la cookie
 * httpOnly `access_token`; los clientes API / móviles pueden mandar
 * `Authorization: Bearer <token>`.
 */
const extractToken = (req: Request): string | null => {
    const fromCookie = req.cookies?.[ACCESS_COOKIE];
    if (typeof fromCookie === "string" && fromCookie.length > 0) return fromCookie;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7);

    return null;
};

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req);
        if (!token) throw new UnauthorizedException("errors.TOKEN_NOT_PROVIDED");

        const decoded = await verifyAccessToken(token);

        const user = await prisma.user.findFirst({
            where: { id: decoded.id, is_active: true, deleted_at: null },
        });
        if (!user) throw new UnauthorizedException("errors.USER_INACTIVE");

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        };
        next();
    } catch (error) {
        next(error);
    }
};
