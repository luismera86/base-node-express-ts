import { BasePath } from "../base.path";

export class GetUserByIdPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "get",
            path: "/user/{id}",
            summary: "Obtener user por ID",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del user",
                    },
                },
            ],
            responses: {
                200: {
                    description: "User encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
                404: {
                    description: "User no encontrado",
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
