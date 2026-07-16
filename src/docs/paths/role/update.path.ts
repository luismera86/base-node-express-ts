import { UpdateRoleSchema } from "../../../modules/role/schemas/role.schema";
import { BasePath } from "../base.path";

export class UpdateRolePath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["role"],
            method: "patch",
            path: "/role/{id}",
            summary: "Actualizar rol (solo admin)",
            description: "Los roles base (admin, user) no pueden renombrarse — la autorización compara por nombre.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del rol",
                    },
                },
            ],
            request: {
                body: {
                    content: {
                        "application/json": { schema: UpdateRoleSchema.body },
                    },
                },
            },
            responses: {
                200: {
                    description: "Rol actualizado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Role",
                            },
                        },
                    },
                },
                400: {
                    description: "Datos inválidos o rol base protegido",
                },
                401: {
                    description: "No autorizado",
                },
                403: {
                    description: "Requiere rol admin",
                },
                404: {
                    description: "Rol no encontrado",
                },
                409: {
                    description: "Ya existe un rol con ese nombre",
                },
            },
        });
    }
}
