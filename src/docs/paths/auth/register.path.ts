import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RegisterSchema } from "../../../modules/auth/schemas/auth.schema";

export class RegisterPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/register",
            summary: "Registrar nuevo usuario",
            description:
                "Crea el usuario y envía el correo de verificación. NO inicia sesión: el login queda " +
                "bloqueado (403) hasta verificar el email.",
            request: {
                body: {
                    content: { "application/json": { schema: RegisterSchema.body } },
                },
            },
            responses: {
                201: { description: "Usuario registrado: correo de verificación enviado" },
                400: { description: "Contraseña débil o datos inválidos" },
                409: { description: "El email ya está en uso" },
            },
        });
    }
}
