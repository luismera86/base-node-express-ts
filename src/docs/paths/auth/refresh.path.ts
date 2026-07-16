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
            summary: "Rotar el par de tokens usando el refresh token",
            description:
                "Lee el refresh de su cookie httpOnly (fallback: `refresh_token` en el body para clientes API), " +
                "rota el par y setea las nuevas cookies. Presentar un refresh ya rotado revoca la sesión completa (detección de reuso).",
            request: {
                body: {
                    content: { "application/json": { schema: RefreshTokenSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Tokens rotados: nuevas cookies seteadas",
                    content: {
                        "application/json": {
                            schema: z
                                .object({
                                    user: z.object({
                                        id: z.string().uuid(),
                                        email: z.string().email(),
                                        role: z.string(),
                                    }),
                                })
                                .openapi("RefreshResponse"),
                        },
                    },
                },
                401: { description: "Refresh token inválido, expirado o reusado" },
            },
        });
    }
}
