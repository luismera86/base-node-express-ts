import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class DeleteUserPath extends BasePath {
  register(): void {
    this.registry.registerPath({
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
  }
}
