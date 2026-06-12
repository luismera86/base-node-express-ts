import { Router } from "express";
import { validarEsquema } from "../../common/middlewares/validar-esquema.middleware";
import { autenticarUsuario } from "../../common/middlewares/autenticar-usuario.middleware";
import { limitadorAutenticacion } from "../../common/middlewares/limite-peticiones.middleware";
import {
    RegistroSchema,
    IniciarSesionSchema,
    RecuperarContrasenaSchema,
    RestablecerContrasenaSchema,
    RefrescarTokenSchema,
} from "./schemas/autenticacion.schema";
import {
    registrarController,
    iniciarSesionController,
    recuperarContrasenaController,
    restablecerContrasenaController,
    refrescarTokenController,
    cerrarSesionController,
} from "./autenticacion.controller";

export const autenticacionRouter = Router();

// Rate limiting en todos los endpoints de autenticación (anti fuerza bruta).
autenticacionRouter.use(limitadorAutenticacion);

autenticacionRouter.post("/registro", validarEsquema(RegistroSchema), registrarController);
autenticacionRouter.post("/iniciar-sesion", validarEsquema(IniciarSesionSchema), iniciarSesionController);
autenticacionRouter.post(
    "/recuperar-contrasena",
    validarEsquema(RecuperarContrasenaSchema),
    recuperarContrasenaController,
);
autenticacionRouter.post(
    "/restablecer-contrasena",
    validarEsquema(RestablecerContrasenaSchema),
    restablecerContrasenaController,
);
autenticacionRouter.post("/refrescar", validarEsquema(RefrescarTokenSchema), refrescarTokenController);
autenticacionRouter.post("/cerrar-sesion", autenticarUsuario, cerrarSesionController);
