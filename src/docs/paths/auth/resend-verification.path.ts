import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { ResendVerificationSchema } from "../../../modules/auth/schemas/auth.schema";

export class ResendVerificationPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/resend-verification",
            summary: "Reenviar el correo de verificación",
            description:
                "Genera un token nuevo (el enlace anterior queda invalidado) y reenvía el correo. " +
                "Responde 204 SIEMPRE — exista o no el email, esté o no verificado (anti-enumeración).",
            request: {
                body: {
                    content: { "application/json": { schema: ResendVerificationSchema.body } },
                },
            },
            responses: {
                204: { description: "Respuesta genérica (no revela si el email existe)" },
            },
        });
    }
}
