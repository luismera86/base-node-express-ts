// src/docs/swagger.ts
import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import envConfig from "../config/env.config";

// Imports de schemas
import { UserSchema } from "../modules/user/schemas/user.schema";
import { RoleSchema } from "../modules/role/schemas/role.schema";

// Imports de paths
import { AuthPaths } from "./paths/auth/auth.paths";
import { MailPaths } from "./paths/mail/mail.paths";
import { UserPaths } from "./paths/user/user.paths";
import { RolePaths } from "./paths/role/role.paths";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

export const registry = new OpenAPIRegistry();

// Registrar schemas
registry.register("User", UserSchema);
registry.register("Role", RoleSchema);

// Registrar paths
new AuthPaths().register();
new MailPaths().register();
new UserPaths().register();
new RolePaths().register();

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
