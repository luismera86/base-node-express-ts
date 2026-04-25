import { Router } from "express";
import { userRouter } from "../../modules/user/user.router";
import { authRouter } from "../../modules/auth/auth.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas

    // Rutas protegidas

    // router.use(authUser);
    router.use("/user", userRouter);
    router.use("/auth", authRouter);
    return router;
};
