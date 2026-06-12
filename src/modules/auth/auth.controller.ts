import { Request, Response, NextFunction } from "express";
import { register } from "./use-cases/register.use-case";
import { login } from "./use-cases/login.use-case";
import { forgotPassword } from "./use-cases/forgot-password.use-case";
import { resetPassword } from "./use-cases/reset-password.use-case";
import { refreshToken } from "./use-cases/refresh-token.use-case";
import { logout } from "./use-cases/logout.use-case";
import { UnauthorizedException } from "../../exceptions/exceptions";

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await forgotPassword(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await resetPassword(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await refreshToken(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new UnauthorizedException("Token no proporcionado");
        const result = await logout(req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
