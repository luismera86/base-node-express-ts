import { Router } from "express";

export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas
    // router.use(authUser);

    // Rutas protegidas

    return router;
};
