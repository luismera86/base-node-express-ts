import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateUserSchema = {
    body: z
        .object({
            first_name: z.string().openapi({ example: "Juan", description: "Nombre del usuario" }),
            last_name: z.string().openapi({ example: "Pérez", description: "Apellido del usuario" }),
            email: z.string().email().openapi({ example: "juan@example.com", description: "Email del usuario" }),
            password: z
                .string()
                .min(8)
                .openapi({ example: "secret1234", description: "Contraseña (mín. 8 caracteres)" }),
            role: z.string().optional().openapi({ example: "user", description: "Rol del usuario" }),
        })
        .openapi("User"),
};

export const UpdateUserSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
    body: CreateUserSchema.body.omit({ password: true }).partial(),
};

export const UserSchema = CreateUserSchema.body.extend({
    id: z.string().uuid(),
    is_active: z.boolean(),
    reset_token: z.string().nullable(),
    reset_token_expires_at: z.date().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().nullable(),
});

export const DeleteUserSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
};

export const GetOneUserSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
};

export type CreateUserDto = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema.body>;
export type UserDto = z.infer<typeof UserSchema>;
