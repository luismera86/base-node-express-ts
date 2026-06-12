import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RestablecerContrasenaSchema } from "../../../modules/autenticacion/schemas/autenticacion.schema";
import { z } from "zod";

export class RestablecerContrasenaPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["autenticacion"],
            method: "post",
            path: "/autenticacion/restablecer-contrasena",
            summary: "Restablecer contraseña con token",
            request: {
                body: {
                    content: { "application/json": { schema: RestablecerContrasenaSchema.body } },
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
