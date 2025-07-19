import { BasePath } from "../base.path";

export class LoginPath extends BasePath {
    register(): void {
        this.registry.registerPath({
            tags: ["auth"],
            method: "post",
            path: "/auth/login",
            summary: "Login",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                email: {
                                    type: "string",
                                    format: "email",
                                    example: "jose.perez@example.com",
                                },
                                password: {
                                    type: "string",
                                    example: "123456",
                                },
                            },
                            required: ["email", "password"],
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "User authenticated and access token",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    user: {
                                        $ref: "#/components/schemas/User",
                                    },
                                    token: {
                                        type: "string",
                                    },
                                },
                            },
                        },
                    },
                },
                401: {
                    description: "Invalid credentials",
                },
            },
        });
    }
}
