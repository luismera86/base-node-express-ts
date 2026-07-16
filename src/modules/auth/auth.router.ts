import { Router } from "express";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { authUser } from "../../common/middlewares/authUser.middleware";
import { authRateLimiter } from "../../common/middlewares/rateLimit.middleware";
import {
    RegisterSchema,
    VerifyEmailSchema,
    ResendVerificationSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    RefreshTokenSchema,
} from "./schemas/auth.schema";
import {
    registerController,
    verifyEmailController,
    resendVerificationController,
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
authRouter.post("/verify-email", validateSchema(VerifyEmailSchema), verifyEmailController);
authRouter.post("/resend-verification", validateSchema(ResendVerificationSchema), resendVerificationController);
authRouter.post("/login", validateSchema(LoginSchema), loginController);
authRouter.post("/forgot-password", validateSchema(ForgotPasswordSchema), forgotPasswordController);
authRouter.post("/reset-password", validateSchema(ResetPasswordSchema), resetPasswordController);
authRouter.post("/refresh", validateSchema(RefreshTokenSchema), refreshTokenController);
authRouter.post("/logout", authUser, logoutController);
