import { BasePath } from "../base.path";
import { CreateUserSchema } from "../../../modules/user/schemas/user.schema";

export class RegisterPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/register",
            summary: "Register",
            security: [],
            request: {
                body: {
                    content: {
                        "application/json": { schema: CreateUserSchema.body },
                    },
                },
            },
            responses: {
                201: {
                    description: "User registered",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/User",
                            },
                        },
                    },
                },
            },
        });
    }
}
