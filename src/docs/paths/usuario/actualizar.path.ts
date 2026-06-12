import { ActualizarUsuarioSchema } from "../../../modules/usuario/schemas/usuario.schema";
import { BasePath } from "../base.path";

export class ActualizarUsuarioPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["usuarios"],
            method: "patch",
            path: "/usuarios/{id}",
            summary: "Actualizar usuario",
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
            request: {
                body: {
                    content: {
                        "application/json": { schema: ActualizarUsuarioSchema.body },
                    },
                },
            },
            responses: {
                200: {
                    description: "Usuario actualizado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Usuario",
                            },
                        },
                    },
                },
                400: {
                    description: "Datos inválidos",
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
