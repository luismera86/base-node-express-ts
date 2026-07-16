import { userRouter } from "../../modules/user/user.router";
import { authRouter } from "../../modules/auth/auth.router";
import { Router } from "express";
import { mailRouter } from "../../modules/mail/mail.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas

    // Rutas protegidas (la autenticación/autorización se aplica dentro de cada router)

    router.use("/auth", authRouter);
    router.use("/user", userRouter);
    router.use("/mail", mailRouter);
    return router;
};
