import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RefreshTokenSchema } from "../../../modules/auth/schemas/auth.schema";
import { z } from "zod";

export class RefreshPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/refresh",
            summary: "Renovar access token con un refresh token",
            request: {
                body: {
                    content: { "application/json": { schema: RefreshTokenSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Tokens renovados (rotación de refresh token)",
                    content: {
                        "application/json": {
                            schema: z
                                .object({ token: z.string(), refresh_token: z.string() })
                                .openapi("RefreshResponse"),
                        },
                    },
                },
                401: { description: "Refresh token inválido o expirado" },
            },
        });
    }
}
