import { createUserRouter } from "../../modules/user/user.router";
import { authUser } from "../middlewares/authUser.middleware";
import { createTestRouter } from "../../modules/test/test.router";
import { createAuthRouter } from "../../modules/auth/auth.router";
import { Router } from "express";
import { createPruebaRouter } from "../../modules/prueba/prueba.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas

    // Rutas protegidas

    router.use("/auth", createAuthRouter());
    router.use(authUser);
    router.use("/user", createUserRouter());
    router.use("/test", createTestRouter());
    router.use("/prueba", createPruebaRouter());
    return router;
};
