import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";
import { prisma } from "../../config/prisma.config";

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) throw new UnauthorizedException("Token no proporcionado");

        const token = authHeader.substring(7);
        const decoded = await verifyToken(token);

        const user = await prisma.user.findFirst({
            where: { id: decoded.id, is_active: true, deleted_at: null },
        });
        if (!user) throw new UnauthorizedException("Usuario no encontrado o inactivo");

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
