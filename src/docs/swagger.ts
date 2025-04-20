// src/docs/swagger.ts
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

const registry = new OpenAPIRegistry();

const UserSchema = z
  .object({
    id: z.string().uuid().openapi({ description: "UUID del usuario" }),
    name: z.string().openapi({ example: "Luis Mera" }),
    email: z.string().email().openapi({ example: "luis@meram.com" }),
    password: z.string().min(8).openapi({ example: "********" }),
  })
  .openapi("User");

registry.register("User", UserSchema);
registry.registerPath({
  tags: ['users'],
  method: 'post',
  path: '/users',
  summary: 'Crear usuario',
  request: {
    body: {
      content: {
        "application/json": { schema: UserSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario creado',
      content: {
        'application/json': { schema: UserSchema },
      },
    },
  },
});
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "API con Bun + Zod + Swagger",
    version: "1.0.0",
  },
});
