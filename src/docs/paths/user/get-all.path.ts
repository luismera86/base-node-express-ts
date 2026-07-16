import { BasePath } from "../base.path";
import { PaginationQuerySchema } from "../../../common/schemas/pagination.schema";

export class GetAllUsersPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "get",
            path: "/user",
            summary: "Obtener todos los user (paginado, solo admin)",
            request: {
                query: PaginationQuerySchema,
            },
            responses: {
                200: {
                    description: "Lista paginada de user",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    items: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/User" },
                                    },
                                    total: { type: "integer", example: 42 },
                                    page: { type: "integer", example: 1 },
                                    limit: { type: "integer", example: 20 },
                                    pages: { type: "integer", example: 3 },
                                },
                            },
                        },
                    },
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
