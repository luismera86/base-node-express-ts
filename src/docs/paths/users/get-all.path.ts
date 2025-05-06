import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserSchema } from "../../../modules/user/schemas/user.schema";

export const registerGetAllUsersPath = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    tags: ['users'],
    method: 'get',
    path: '/users',
    summary: 'Obtener todos los usuarios',
    responses: {
      200: {
        description: 'Lista de usuarios',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
          },
        },
      },
    },
  });
}; 