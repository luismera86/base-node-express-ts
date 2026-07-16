import { BasePath } from "../base.path";
import { PaginationQuerySchema } from "../../../common/schemas/pagination.schema";

export class GetAllRolesPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["role"],
            method: "get",
            path: "/role",
            summary: "Obtener todos los roles (paginado, solo admin)",
            request: {
                query: PaginationQuerySchema,
            },
            responses: {
                200: {
                    description: "Lista paginada de roles (cada rol incluye _count.users)",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    items: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Role" },
                                    },
                                    total: { type: "integer", example: 3 },
                                    page: { type: "integer", example: 1 },
                                    limit: { type: "integer", example: 20 },
                                    pages: { type: "integer", example: 1 },
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
