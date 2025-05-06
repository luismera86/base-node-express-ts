import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserSchema } from "../../../modules/user/schemas/user.schema";
import { BasePath } from "../base.path";

export class UpdateUserPath extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ['users'],
      method: 'put',
      path: '/users/{id}',
      summary: 'Actualizar usuario',
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
      request: {
        body: {
          content: {
            "application/json": { schema: UserSchema },
          },
        },
      },
      responses: {
        200: {
          description: 'Usuario actualizado',
          content: {
            'application/json': { 
              schema: {
                $ref: '#/components/schemas/User'
              }
            },
          },
        },
        404: {
          description: 'Usuario no encontrado',
        },
      },
    });
  }
}
