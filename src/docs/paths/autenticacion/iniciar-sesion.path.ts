import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { IniciarSesionSchema } from "../../../modules/autenticacion/schemas/autenticacion.schema";
import { z } from "zod";

export class IniciarSesionPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["autenticacion"],
            method: "post",
            path: "/autenticacion/iniciar-sesion",
            summary: "Iniciar sesión",
            request: {
                body: {
                    content: { "application/json": { schema: IniciarSesionSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Inicio de sesión exitoso",
                    content: {
                        "application/json": {
                            schema: z
                                .object({ token: z.string(), token_refresco: z.string() })
                                .openapi("IniciarSesionResponse"),
                        },
                    },
                },
                401: { description: "Credenciales inválidas" },
            },
        });
    }
}
