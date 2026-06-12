import { BasePath } from "../base.path";

export class EliminarUsuarioPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["usuarios"],
            method: "delete",
            path: "/usuarios/{id}",
            summary: "Eliminar usuario",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del usuario",
                    },
                },
            ],
            responses: {
                200: {
                    description: "Usuario eliminado",
                },
                404: {
                    description: "Usuario no encontrado",
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
