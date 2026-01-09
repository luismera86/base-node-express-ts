// src/docs/swagger.ts
import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import envConfig from "../config/env.config";

// Imports de schemas
// import { UserSchema } from "../modules/user/schemas/user.schema";

// Imports de paths
// import { AuthPaths } from "./paths/auth/auth.paths";
// import { UserPaths } from "./paths/user/user.paths";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

export const registry = new OpenAPIRegistry();

// Registrar schemas
// registry.register("User", UserSchema);
// registry.register("User", UserSchema);

// Registrar paths
// new AuthPaths().register();
// new UserPaths().register();

const generator = new OpenApiGeneratorV3(registry.definitions);

const baseDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "API Emooti",
        version: "1.0.0",
        description: "API de Emooti con autenticación JWT",
    },
    servers: [
        {
            url: envConfig.API_URL || "http://localhost:3000/api",
            description: "API Server Emooti",
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
