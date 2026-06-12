import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";
import { RegistroSchema } from "../../../modules/autenticacion/schemas/autenticacion.schema";

export class RegistroPath extends BasePath {
    constructor(registry: OpenAPIRegistry) {
        super(registry);
    }

    register(): void {
        this.registry.registerPath({
            tags: ["autenticacion"],
            method: "post",
            path: "/autenticacion/registro",
            summary: "Registrar nuevo usuario",
            request: {
                body: {
                    content: { "application/json": { schema: RegistroSchema.body } },
                },
            },
            responses: {
                201: { description: "Usuario registrado exitosamente" },
                409: { description: "El correo ya está en uso" },
            },
        });
    }
}
