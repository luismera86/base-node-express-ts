import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RefrescarTokenSchema } from "../../../modules/autenticacion/schemas/autenticacion.schema";
import { z } from "zod";

export class RefrescarPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["autenticacion"],
            method: "post",
            path: "/autenticacion/refrescar",
            summary: "Renovar access token con un refresh token",
            request: {
                body: {
                    content: { "application/json": { schema: RefrescarTokenSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Tokens renovados (rotación de refresh token)",
                    content: {
                        "application/json": {
                            schema: z
                                .object({ token: z.string(), token_refresco: z.string() })
                                .openapi("RefrescarResponse"),
                        },
                    },
                },
                401: { description: "Token de refresco inválido o expirado" },
            },
        });
    }
}
