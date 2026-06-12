import { Router } from "express";
import { userRouter } from "../../modules/user/user.router";
import { authRouter } from "../../modules/auth/auth.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas
    router.use("/auth", authRouter);

    // Rutas protegidas (la autenticación/autorización se aplica dentro de cada router)
    router.use("/user", userRouter);

    return router;
};
