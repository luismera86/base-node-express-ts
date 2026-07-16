import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { VerifyEmailSchema } from "../../../modules/auth/schemas/auth.schema";

export class VerifyEmailPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/verify-email",
            summary: "Verificar el correo con el token recibido",
            description: "Consume el token de verificación (un solo uso) y habilita el login.",
            request: {
                body: {
                    content: { "application/json": { schema: VerifyEmailSchema.body } },
                },
            },
            responses: {
                204: { description: "Correo verificado" },
                400: { description: "Token inválido o expirado" },
            },
        });
    }
}
