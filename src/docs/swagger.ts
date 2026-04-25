import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import envConfig from "../config/env.config";
import { UserSchema } from "../modules/user/schemas/user.schema";
import { UserPaths } from "./paths/user/user.paths";
import { AuthPaths } from "./paths/auth/auth.paths";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.register("User", UserSchema);

new UserPaths().register();
new AuthPaths().register();

const generator = new OpenApiGeneratorV3(registry.definitions);

const apiUrl = (envConfig.API_URL || "http://localhost:3000/api").replace(/\/api$/, "/api/v1");

const baseDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "API",
        version: "1.0.0",
        description: "API con autenticación JWT",
    },
    servers: [
        {
            url: apiUrl,
            description: "API Server",
        },
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
});

export const openApiDoc = {
    ...baseDoc,
    components: {
        ...(baseDoc.components || {}),
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Insert the JWT token in the format: Bearer <token>",
            },
        },
    },
};
