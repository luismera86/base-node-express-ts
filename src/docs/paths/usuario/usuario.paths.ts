import { BasePath } from "../base.path";
import { CrearUsuarioPath } from "./crear.path";
import { ObtenerTodosUsuariosPath } from "./obtener-todos.path";
import { ObtenerUsuarioPorIdPath } from "./obtener-por-id.path";
import { ActualizarUsuarioPath } from "./actualizar.path";
import { EliminarUsuarioPath } from "./eliminar.path";
import { registry } from "../../swagger";

export class UsuarioPaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new CrearUsuarioPath(this.registry).register();
        new ObtenerTodosUsuariosPath(this.registry).register();
        new ObtenerUsuarioPorIdPath(this.registry).register();
        new ActualizarUsuarioPath(this.registry).register();
        new EliminarUsuarioPath(this.registry).register();
    }
}
