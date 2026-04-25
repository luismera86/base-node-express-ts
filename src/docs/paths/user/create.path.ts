import { CreateUserSchema } from "../../../modules/user/schemas/user.schema";
import { BasePath } from "../base.path";

export class CreateUserPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["user"],
            method: "post",
            path: "/user",
            summary: "Crear user",
            request: {
                body: {
                    content: {
                        "application/json": { schema: CreateUserSchema.body },
                    },
                },
            },
            responses: {
                201: {
                    description: "User creado",
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
                401: {
                    description: "No autorizado",
                },
            },
        });
    }
}
