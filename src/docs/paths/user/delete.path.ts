import { BasePath } from "../base.path";

export class DeleteUserPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "delete",
            path: "/user/{id}",
            summary: "Eliminar user",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "number",
                        description: "ID del user",
                    },
                },
            ],
            responses: {
                200: {
                    description: "User eliminado",
                },
                404: {
                    description: "User no encontrado",
                },
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
