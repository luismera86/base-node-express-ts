import { Request, Response, NextFunction } from "express";
import { registrar } from "./use-cases/registrar.use-case";
import { iniciarSesion } from "./use-cases/iniciar-sesion.use-case";
import { recuperarContrasena } from "./use-cases/recuperar-contrasena.use-case";
import { restablecerContrasena } from "./use-cases/restablecer-contrasena.use-case";
import { refrescarToken } from "./use-cases/refrescar-token.use-case";
import { cerrarSesion } from "./use-cases/cerrar-sesion.use-case";
import { UnauthorizedException } from "../../exceptions/exceptions";

export const registrarController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await registrar(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const iniciarSesionController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await iniciarSesion(req.body);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const recuperarContrasenaController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await recuperarContrasena(req.body);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const restablecerContrasenaController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await restablecerContrasena(req.body);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const refrescarTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultado = await refrescarToken(req.body);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const cerrarSesionController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.usuario) throw new UnauthorizedException("Token no proporcionado");
        const resultado = await cerrarSesion(req.usuario.id);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};
