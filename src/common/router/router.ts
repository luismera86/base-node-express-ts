import { Router } from "express";
import { createAuthRouter } from "../../modules/auth/auth.router";

import { createUserRouter } from "../../modules/user/user.router";

import { authUser } from "../middlewares/authUser.middleware";

export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas

    // Rutas protegidas

    router.use("/auth", createAuthRouter());
    router.use(authUser);
    router.use("/user", createUserRouter());

    return router;
};
