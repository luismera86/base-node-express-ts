import { NextFunction, Request, Response } from "express";
import { ForbiddenException, UnauthorizedException } from "../../exceptions/exceptions";
import { Rol } from "../enums/rol.enum";

/**
 * Permite la operación si el usuario es ADMINISTRADOR o si actúa sobre su propio
 * recurso (`req.usuario.id === req.params.id`). Evita IDOR en rutas tipo `/usuarios/:id`.
 * Debe usarse después de `autenticarUsuario`.
 */
export const propietarioOAdmin = (param = "id") => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.usuario) return next(new UnauthorizedException("Token no proporcionado"));
        const esAdmin = req.usuario.rol === Rol.ADMINISTRADOR;
        if (esAdmin || req.usuario.id === req.params[param]) return next();
        next(new ForbiddenException("No tienes permisos sobre este recurso"));
    };
};

/**
 * Elimina campos privilegiados del body cuando el solicitante NO es administrador,
 * evitando escalada de privilegios al auto-editarse (p. ej. `rol`, `activo`).
 */
export const restringirCamposPrivilegiados = (req: Request, _res: Response, next: NextFunction) => {
    if (req.usuario?.rol !== Rol.ADMINISTRADOR && req.body && typeof req.body === "object") {
        delete (req.body as Record<string, unknown>).rol;
        delete (req.body as Record<string, unknown>).activo;
    }
    next();
};
