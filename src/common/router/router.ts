// import { authUser } from "../middlewares/authUser.middleware";
import { Router } from "express";
import { testRouter } from "../../modules/test/test.router";
import { test2Router } from "../../modules/test2/test2.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas (sin autenticación)

    // Middleware de autenticación para rutas protegidas

    // Rutas protegidas

    // router.use(authUser);
    router.use("/test", testRouter);
    router.use("/test2", test2Router);
    return router;
};
