import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { BasePath } from "../base.path";

export class GetAllUsersPath extends BasePath {
  register(): void {
    this.registry.registerPath({
      tags: ["users"],
      method: "get",
      path: "/users",
      summary: "Obtener todos los usuarios",
      responses: {
        200: {
          description: "Lista de usuarios",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
      },
    });
  }
}
