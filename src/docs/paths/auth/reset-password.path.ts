import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { ResetPasswordSchema } from "../../../modules/auth/schemas/auth.schema";

export class ResetPasswordPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/reset-password",
            summary: "Restablecer la contraseña con el token recibido",
            description:
                "Valida el token (un solo uso, con vencimiento), aplica la política de contraseñas y " +
                "revoca todas las sesiones activas del usuario.",
            request: {
                body: {
                    content: { "application/json": { schema: ResetPasswordSchema.body } },
                },
            },
            responses: {
                204: { description: "Contraseña actualizada" },
                400: { description: "Token inválido o expirado, o contraseña débil" },
            },
        });
    }
}
