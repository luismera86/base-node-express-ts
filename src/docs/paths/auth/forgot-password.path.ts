import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { ForgotPasswordSchema } from "../../../modules/auth/schemas/auth.schema";
import { z } from "zod";

export class ForgotPasswordPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/forgot-password",
            summary: "Solicitar reset de contraseña",
            request: {
                body: {
                    content: { "application/json": { schema: ForgotPasswordSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Respuesta genérica (no revela si el email existe)",
                    content: {
                        "application/json": {
                            schema: z.object({ message: z.string() }).openapi("MessageResponse"),
                        },
                    },
                },
            },
        });
    }
}
