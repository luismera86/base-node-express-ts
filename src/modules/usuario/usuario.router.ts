import { Router } from "express";
import { autenticarUsuario } from "../../common/middlewares/autenticar-usuario.middleware";
import { requerirRol } from "../../common/middlewares/requerir-rol.middleware";
import { propietarioOAdmin, restringirCamposPrivilegiados } from "../../common/middlewares/propiedad.middleware";
import { validarEsquema } from "../../common/middlewares/validar-esquema.middleware";
import { Rol } from "../../common/enums/rol.enum";
import {
    CrearUsuarioSchema,
    ActualizarUsuarioSchema,
    ObtenerUsuarioSchema,
    EliminarUsuarioSchema,
} from "./schemas/usuario.schema";
import {
    obtenerTodosUsuariosController,
    obtenerUsuarioController,
    crearUsuarioController,
    actualizarUsuarioController,
    eliminarUsuarioController,
} from "./usuario.controller";

export const usuarioRouter = Router();

// Todas las rutas de /usuarios requieren autenticación.
usuarioRouter.use(autenticarUsuario);

usuarioRouter.get("/", requerirRol(Rol.ADMINISTRADOR), obtenerTodosUsuariosController);
usuarioRouter.get("/:id", validarEsquema(ObtenerUsuarioSchema), propietarioOAdmin(), obtenerUsuarioController);
usuarioRouter.post("/", requerirRol(Rol.ADMINISTRADOR), validarEsquema(CrearUsuarioSchema), crearUsuarioController);
usuarioRouter.patch(
    "/:id",
    validarEsquema(ActualizarUsuarioSchema),
    propietarioOAdmin(),
    restringirCamposPrivilegiados,
    actualizarUsuarioController,
);
usuarioRouter.delete(
    "/:id",
    requerirRol(Rol.ADMINISTRADOR),
    validarEsquema(EliminarUsuarioSchema),
    eliminarUsuarioController,
);
