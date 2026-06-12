import { CrearUsuarioSchema } from "../../../modules/usuario/schemas/usuario.schema";
import { BasePath } from "../base.path";

export class CrearUsuarioPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["usuarios"],
            method: "post",
            path: "/usuarios",
            summary: "Crear usuario",
            request: {
                body: {
                    content: {
                        "application/json": { schema: CrearUsuarioSchema.body },
                    },
                },
            },
            responses: {
                201: {
                    description: "Usuario creado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Usuario",
                            },
                        },
                    },
                },
                400: {
                    description: "Datos inválidos",
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
