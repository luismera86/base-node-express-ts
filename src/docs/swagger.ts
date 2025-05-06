// src/docs/swagger.ts
import { z } from "zod";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { UserSchema } from "../modules/user/schemas/user.schema";
import { UserPaths } from "./paths/users/user.paths";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

export const registry = new OpenAPIRegistry();

// Registrar schemas
registry.register("User", UserSchema);

// Registrar paths
new UserPaths().register();

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDoc = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "API con Bun + Zod + Swagger",
    version: "1.0.0",
  },
});
