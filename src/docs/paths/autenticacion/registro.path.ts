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
            request: {
                body: {
                    content: { "application/json": { schema: RegisterSchema.body } },
                },
            },
            responses: {
                201: { description: "Usuario registrado exitosamente" },
                409: { description: "El email ya está en uso" },
            },
        });
    }
}
