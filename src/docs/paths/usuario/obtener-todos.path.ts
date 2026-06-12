import { BasePath } from "../base.path";

export class GetAllUsersPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "get",
            path: "/user",
            summary: "Obtener todos los user",
            responses: {
                200: {
                    description: "Lista de user",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/User",
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
