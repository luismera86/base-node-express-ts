import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";
import { Role } from "../enums/role.enum";

/**
 * Permite el acceso solo si `req.user.role` está dentro de los roles indicados.
 * Debe usarse SIEMPRE después de `authUser`.
 */
export const requireRole = (...roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new UnauthorizedException("errors.TOKEN_NOT_PROVIDED"));
        if (!roles.includes(req.user.role as Role)) {
            return next(new ForbiddenException("errors.FORBIDDEN"));
        }
        next();
    };
};
