import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.util";
import { UnauthorizedException } from "../../exceptions/exceptions";
import { User } from "../../modules/user/entities/user.entity";
import AppDataSource from "../../config/datasource.config";

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) throw new UnauthorizedException("No token provided");

        const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        const decoded = verifyToken(token);
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: decoded.id },
        });
        req.user = user as unknown as User;
        next();
    } catch (error) {
        next(error);
    }
};
