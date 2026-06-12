import { Router } from "express";
import { usuarioRouter } from "../../modules/usuario/usuario.router";
import { autenticacionRouter } from "../../modules/autenticacion/autenticacion.router";
export const createBaseRouter = (): Router => {
    const router = Router();

    // Rutas públicas
    router.use("/autenticacion", autenticacionRouter);

    // Rutas protegidas (la autenticación/autorización se aplica dentro de cada router)
    router.use("/usuarios", usuarioRouter);

    return router;
};
