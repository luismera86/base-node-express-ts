// schemas/user.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

export const CreateUserSchema = {
  body: z
    .object({
      firstName: z.string().openapi({ example: "Juan", description: "Nombre del usuario" }),
      lastName: z.string().openapi({ example: "Perez", description: "Apellido del usuario" }),
      email: z
        .string()
        .email()
        .openapi({ example: "jp@email.com", description: "Correo electrónico del usuario" }),
      password: z
        .string()
        .min(8)
        .openapi({ example: "********", description: "Contraseña del usuario" }),
    })
    .openapi("User"),
};

export const UpdateUserSchema = CreateUserSchema.body.partial();
export const UserSchema = CreateUserSchema.body.extend({
  id: z.string().uuid(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserSchema = z.infer<typeof UserSchema>;
