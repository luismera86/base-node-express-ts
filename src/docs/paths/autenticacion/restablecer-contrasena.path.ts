import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { ResetPasswordSchema } from "../../../modules/auth/schemas/auth.schema";
import { z } from "zod";

export class ResetPasswordPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/reset-password",
            summary: "Resetear contraseña con token",
            request: {
                body: {
                    content: { "application/json": { schema: ResetPasswordSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Contraseña actualizada exitosamente",
                    content: {
                        "application/json": {
                            schema: z.object({ message: z.string() }),
                        },
                    },
                },
                400: { description: "Token inválido o expirado" },
                404: { description: "Usuario no encontrado" },
            },
        });
    }
}
