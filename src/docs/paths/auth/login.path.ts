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
            summary: "Iniciar sesión",
            request: {
                body: {
                    content: { "application/json": { schema: LoginSchema.body } },
                },
            },
            responses: {
                200: {
                    description: "Login exitoso",
                    content: {
                        "application/json": {
                            schema: z.object({ token: z.string() }).openapi("LoginResponse"),
                        },
                    },
                },
                401: { description: "Credenciales inválidas" },
            },
        });
    }
}
