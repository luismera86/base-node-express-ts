import { Request, Response, NextFunction } from "express";
import { register } from "./use-cases/register.use-case";
import { verifyEmail } from "./use-cases/verify-email.use-case";
import { resendVerification } from "./use-cases/resend-verification.use-case";
import { login } from "./use-cases/login.use-case";
import { forgotPassword } from "./use-cases/forgot-password.use-case";
import { resetPassword } from "./use-cases/reset-password.use-case";
import { refreshToken } from "./use-cases/refresh-token.use-case";
import { logout } from "./use-cases/logout.use-case";
import { UnauthorizedException } from "../../exceptions/exceptions";
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "../../common/utils/cookie.util";
import { DEFAULT_LANG } from "../../common/i18n/i18n.util";

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await register(req.body, req.lang ?? DEFAULT_LANG);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await verifyEmail(req.body);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// 204 SIEMPRE — exista o no el email, esté o no verificado (anti-enumeración).
export const resendVerificationController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await resendVerification(req.body, req.lang ?? DEFAULT_LANG);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Los tokens se entregan en cookies httpOnly, NUNCA en el body: si viajaran en
 * la respuesta, un XSS podría llamar a /refresh y leer tokens frescos, anulando
 * el beneficio de httpOnly. Los clientes API leen las cabeceras Set-Cookie.
 */
export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken, refreshToken: refresh, user } = await login(req.body);
        setAuthCookies(res, { accessToken, refreshToken: refresh });
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

// 204 SIEMPRE — exista o no el email (anti-enumeración).
export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await forgotPassword(req.body, req.lang ?? DEFAULT_LANG);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await resetPassword(req.body);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Cookie-first (path restringido a este endpoint); fallback body para clientes API.
        const rawToken: string | undefined = req.cookies?.[REFRESH_COOKIE] || req.body?.refresh_token;
        if (!rawToken) throw new UnauthorizedException("errors.TOKEN_NOT_PROVIDED");

        const { accessToken, refreshToken: rotated, user } = await refreshToken(rawToken);
        setAuthCookies(res, { accessToken, refreshToken: rotated });
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new UnauthorizedException("errors.TOKEN_NOT_PROVIDED");
        await logout(req.user.id);
        clearAuthCookies(res);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
