import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerCreateUserPath } from "./create.path";
import { registerGetAllUsersPath } from "./get-all.path";
import { registerGetUserByIdPath } from "./get-by-id.path";
import { registerUpdateUserPath } from "./update.path";
import { registerDeleteUserPath } from "./delete.path";

export const registerUserPaths = (registry: OpenAPIRegistry) => {
  registerCreateUserPath(registry);
  registerGetAllUsersPath(registry);
  registerGetUserByIdPath(registry);
  registerUpdateUserPath(registry);
  registerDeleteUserPath(registry);
}; 