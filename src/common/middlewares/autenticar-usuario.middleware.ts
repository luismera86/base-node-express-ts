import { NextFunction, Request, Response } from "express";
import { verificarToken } from "../utils/jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";
import { prisma } from "../../config/prisma.config";

export const autenticarUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cabeceraAuth = req.headers.authorization;
        if (!cabeceraAuth?.startsWith("Bearer ")) throw new UnauthorizedException("Token no proporcionado");

        const token = cabeceraAuth.substring(7);
        const decodificado = await verificarToken(token);

        const usuario = await prisma.usuario.findFirst({
            where: { id: decodificado.id, activo: true, eliminado_en: null },
        });
        if (!usuario) throw new UnauthorizedException("Usuario no encontrado o inactivo");

        req.usuario = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
            activo: usuario.activo,
        };
        next();
    } catch (error) {
        next(error);
    }
};
