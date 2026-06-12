import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { z } from "zod";

export class LogoutPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/logout",
            summary: "Cerrar sesión (revoca el refresh token)",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Sesión cerrada",
                    content: {
                        "application/json": {
                            schema: z.object({ message: z.string() }).openapi("LogoutResponse"),
                        },
                    },
                },
                401: { description: "No autorizado" },
            },
        });
    }
}
