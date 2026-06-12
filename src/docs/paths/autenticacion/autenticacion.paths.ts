import { BasePath } from "../base.path";
import { RegistroPath } from "./registro.path";
import { IniciarSesionPath } from "./iniciar-sesion.path";
import { RecuperarContrasenaPath } from "./recuperar-contrasena.path";
import { RestablecerContrasenaPath } from "./restablecer-contrasena.path";
import { RefrescarPath } from "./refrescar.path";
import { CerrarSesionPath } from "./cerrar-sesion.path";
import { registry } from "../../swagger";

export class AutenticacionPaths extends BasePath {
    constructor() {
        super(registry);
    }

    register(): void {
        new RegistroPath(this.registry).register();
        new IniciarSesionPath(this.registry).register();
        new RecuperarContrasenaPath(this.registry).register();
        new RestablecerContrasenaPath(this.registry).register();
        new RefrescarPath(this.registry).register();
        new CerrarSesionPath(this.registry).register();
    }
}
