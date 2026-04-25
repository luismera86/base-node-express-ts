import { Router } from "express";
import { validateSchema } from "../../common/middlewares/validateSchema.middleware";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "./schemas/auth.schema";
import {
    registerController,
    loginController,
    forgotPasswordController,
    resetPasswordController,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", validateSchema(RegisterSchema), registerController);
authRouter.post("/login", validateSchema(LoginSchema), loginController);
authRouter.post("/forgot-password", validateSchema(ForgotPasswordSchema), forgotPasswordController);
authRouter.post("/reset-password", validateSchema(ResetPasswordSchema), resetPasswordController);
