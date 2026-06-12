import { BasePath } from "../base.path";

export class ObtenerUsuarioPorIdPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["usuarios"],
            method: "get",
            path: "/usuarios/{id}",
            summary: "Obtener usuario por ID",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del usuario",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Usuario encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Usuario",
                            },
                        },
                    },
                },
                404: {
                    description: "Usuario no encontrado",
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
