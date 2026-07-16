import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { LoginSchema } from "../../../modules/auth/schemas/auth.schema";
import { z } from "zod";

export class LoginPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/login",
            summary: "Iniciar sesión (tokens en cookies httpOnly)",
            description:
                "Setea las cookies httpOnly `access_token` y `refresh_token` (Set-Cookie); los tokens nunca viajan en el body. " +
                "Mismo 401 exista o no el email (anti-enumeración). 403 si el correo no está verificado.",
            request: {
                body: {
                    content: { "application/json": { schema: LoginSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Login exitoso: cookies seteadas, datos básicos del usuario en el body",
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
                                .openapi("LoginResponse"),
                        },
                    },
                },
                401: { description: "Credenciales inválidas" },
                403: { description: "Correo no verificado" },
            },
        });
    }
}
