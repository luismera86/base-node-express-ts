import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import envConfig from "../config/env.config";
import { UsuarioSchema } from "../modules/usuario/schemas/usuario.schema";
import { UsuarioPaths } from "./paths/usuario/usuario.paths";
import { AutenticacionPaths } from "./paths/autenticacion/autenticacion.paths";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.register("Usuario", UsuarioSchema);

new UsuarioPaths().register();
new AutenticacionPaths().register();

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
            description: "Servidor de la API",
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
                description: "Inserta el token JWT con el formato: Bearer <token>",
            },
        },
    },
};
