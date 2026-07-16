import { BasePath } from "../base.path";

export class GetRoleByIdPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["role"],
            method: "get",
            path: "/role/{id}",
            summary: "Obtener rol por ID (solo admin)",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del rol",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Rol encontrado (incluye _count.users)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Role",
                            },
                        },
                    },
                },
                404: {
                    description: "Rol no encontrado",
                },
                401: {
                    description: "No autorizado",
                },
                403: {
                    description: "Requiere rol admin",
                },
            },
        });
    }
}
