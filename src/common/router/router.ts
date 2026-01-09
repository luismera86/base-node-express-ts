import { Router } from "express";

import { authUser } from "../middlewares/authUser.middleware";

export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas

    // Rutas protegidas

    router.use(authUser);

    return router;
};
