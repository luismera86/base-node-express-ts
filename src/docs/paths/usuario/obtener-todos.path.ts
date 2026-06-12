import { BasePath } from "../base.path";

export class ObtenerTodosUsuariosPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["usuarios"],
            method: "get",
            path: "/usuarios",
            summary: "Obtener todos los usuarios",
            responses: {
                200: {
                    description: "Lista de usuarios",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/Usuario",
                                },
                            },
                        },
                    },
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
