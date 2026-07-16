import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class LogoutPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/logout",
            summary: "Cerrar sesión (revoca el refresh token y limpia las cookies)",
            security: [{ bearerAuth: [] }],
            responses: {
                204: { description: "Sesión cerrada" },
                401: { description: "No autorizado" },
            },
        });
    }
}
