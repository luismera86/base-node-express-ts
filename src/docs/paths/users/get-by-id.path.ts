import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class GetUserByIdPath extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["users"],
      method: "get",
      path: "/users/{id}",
      summary: "Obtener usuario por ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID del usuario",
        },
      ],
      responses: {
        200: {
          description: "Usuario encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        },
        404: {
          description: "Usuario no encontrado",
        },
      },
    });
  }
}
