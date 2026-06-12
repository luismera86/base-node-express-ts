import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RecuperarContrasenaSchema } from "../../../modules/autenticacion/schemas/autenticacion.schema";
import { z } from "zod";

export class RecuperarContrasenaPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["autenticacion"],
            method: "post",
            path: "/autenticacion/recuperar-contrasena",
            summary: "Solicitar recuperación de contraseña",
            request: {
                body: {
                    content: { "application/json": { schema: RecuperarContrasenaSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Respuesta genérica (no revela si el correo existe)",
                    content: {
                        "application/json": {
                            schema: z.object({ message: z.string() }).openapi("MensajeResponse"),
                        },
                    },
                },
            },
        });
    }
}
