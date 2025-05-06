import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const registerDeleteUserPath = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    tags: ['users'],
    method: 'delete',
    path: '/users/{id}',
    summary: 'Eliminar usuario',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
        description: 'ID del usuario',
      },
    ],
    responses: {
      204: {
        description: 'Usuario eliminado',
      },
      404: {
        description: 'Usuario no encontrado',
      },
    },
  });
}; 