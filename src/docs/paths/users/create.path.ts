import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserSchema } from "../../../modules/user/schemas/user.schema";

export const registerCreateUserPath = (registry: OpenAPIRegistry) => {
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
          'application/json': { 
            schema: {
              $ref: '#/components/schemas/User'
            }
          },
        },
      },
    },
  });
}; 