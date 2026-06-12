import { UpdateUserSchema } from "../../../modules/user/schemas/user.schema";
import { BasePath } from "../base.path";

export class UpdateUserPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "patch",
            path: "/user/{id}",
            summary: "Actualizar user",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        description: "ID del user",
                    },
                },
            ],
            request: {
                body: {
                    content: {
                        "application/json": { schema: UpdateUserSchema.body },
                    },
                },
            },
            responses: {
                200: {
                    description: "User actualizado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
                400: {
                    description: "Datos inválidos",
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
