import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";
import { Rol } from "../enums/rol.enum";

/**
 * Permite el acceso solo si `req.usuario.rol` está dentro de los roles indicados.
 * Debe usarse SIEMPRE después de `autenticarUsuario`.
 */
export const requerirRol = (...roles: Rol[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.usuario) return next(new UnauthorizedException("Token no proporcionado"));
        if (!roles.includes(req.usuario.rol as Rol)) {
            return next(new ForbiddenException("No tienes permisos para realizar esta acción"));
        }
        next();
    };
};
