import { CreateRoleSchema } from "../../../modules/role/schemas/role.schema";
import { BasePath } from "../base.path";

export class CreateRolePath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["role"],
            method: "post",
            path: "/role",
            summary: "Crear rol (solo admin)",
            request: {
                body: {
                    content: {
                        "application/json": { schema: CreateRoleSchema.body },
                    },
                },
            },
            responses: {
                201: {
                    description: "Rol creado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Role",
                            },
                        },
                    },
                },
                400: {
                    description: "Datos inválidos",
                },
                401: {
                    description: "No autorizado",
                },
                403: {
                    description: "Requiere rol admin",
                },
                409: {
                    description: "Ya existe un rol con ese nombre",
                },
            },
        });
    }
}
