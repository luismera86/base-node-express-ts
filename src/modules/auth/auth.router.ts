import { Router } from "express";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { authUser } from "../../common/middlewares/authUser.middleware";
import { authRateLimiter } from "../../common/middlewares/rateLimit.middleware";
import {
    RegisterSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    RefreshTokenSchema,
} from "./schemas/auth.schema";
import {
    registerController,
    loginController,
    forgotPasswordController,
    resetPasswordController,
    refreshTokenController,
    logoutController,
} from "./auth.controller";

export const authRouter = Router();

// Rate limiting en todos los endpoints de autenticación (anti fuerza bruta).
authRouter.use(authRateLimiter);

authRouter.post("/register", validateSchema(RegisterSchema), registerController);
authRouter.post("/login", validateSchema(LoginSchema), loginController);
authRouter.post("/forgot-password", validateSchema(ForgotPasswordSchema), forgotPasswordController);
authRouter.post("/reset-password", validateSchema(ResetPasswordSchema), resetPasswordController);
authRouter.post("/refresh", validateSchema(RefreshTokenSchema), refreshTokenController);
authRouter.post("/logout", authUser, logoutController);
