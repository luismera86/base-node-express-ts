import { BasePath } from "../base.path";

export class DeleteRolePath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["role"],
            method: "delete",
            path: "/role/{id}",
            summary: "Eliminar rol (solo admin)",
            description:
                "Soft delete. Los roles base (admin, user) no pueden eliminarse, y un rol con usuarios asignados responde 409.",
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
            responses: {
                200: {
                    description: "Rol eliminado",
                },
                400: {
                    description: "Rol base protegido",
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
                    description: "El rol tiene usuarios asignados",
                },
            },
        });
    }
}
