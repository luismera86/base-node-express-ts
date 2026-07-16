import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";
import { Role } from "../enums/role.enum";

/**
 * Permite la operación si el usuario es ADMIN o si actúa sobre su propio recurso
 * (`req.user.id === req.params.id`). Evita IDOR en rutas tipo `/user/:id`.
 * Debe usarse después de `authUser`.
 */
export const ownerOrAdmin = (param = "id") => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new UnauthorizedException("errors.TOKEN_NOT_PROVIDED"));
        const isAdmin = req.user.role === Role.ADMIN;
        if (isAdmin || req.user.id === req.params[param]) return next();
        next(new ForbiddenException("errors.FORBIDDEN"));
    };
};

/**
 * Elimina campos privilegiados del body cuando el solicitante NO es admin,
 * evitando escalada de privilegios al auto-editarse (p. ej. `role`, `is_active`).
 */
export const restrictPrivilegedFields = (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== Role.ADMIN && req.body && typeof req.body === "object") {
        delete (req.body as Record<string, unknown>).role;
        delete (req.body as Record<string, unknown>).is_active;
    }
    next();
};
