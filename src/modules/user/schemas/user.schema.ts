import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { PaginationQuerySchema } from "../../../common/schemas/pagination.schema";
import { strongPasswordSchema } from "../../../common/schemas/strong-password.schema";

extendZodWithOpenApi(z);

export const GetAllUsersSchema = {
    query: PaginationQuerySchema,
};

export const CreateUserSchema = {
    body: z
        .object({
            first_name: z.string().openapi({ example: "Juan", description: "Nombre del usuario" }),
            last_name: z.string().openapi({ example: "Pérez", description: "Apellido del usuario" }),
            email: z.string().email().openapi({ example: "juan@example.com", description: "Email del usuario" }),
            password: strongPasswordSchema.openapi({
                example: "Secret1234!",
                description: "Contraseña (8-128 caracteres, con minúscula, mayúscula, número y especial)",
            }),
            role: z
                .string()
                .trim()
                .toLowerCase()
                .optional()
                .openapi({ example: "user", description: "Nombre del rol (de la tabla roles); default: user" }),
        })
        .openapi("User"),
};

// Update por admin: permite cambiar role.
export const UpdateUserSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
    body: CreateUserSchema.body.omit({ password: true }).partial(),
};

// Update propio (no-admin): NO permite cambiar role.
export const UpdateUserSelfSchema = {
    params: UpdateUserSchema.params,
    body: CreateUserSchema.body.omit({ password: true, role: true }).partial(),
};

// Schema de salida: NO incluye campos sensibles (password, reset_token,
// reset_token_expires_at, refresh_token) — coherente con el `omit` global de Prisma.
// El rol sale como objeto (relación con la tabla roles).
export const UserSchema = CreateUserSchema.body.omit({ password: true, role: true }).extend({
    id: z.string().uuid(),
    role_id: z.string().uuid(),
    role: z.object({
        id: z.string().uuid(),
        name: z.string().openapi({ example: "user" }),
        description: z.string().nullable(),
    }),
    is_active: z.boolean(),
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
export type UpdateUserSelfDto = z.infer<typeof UpdateUserSelfSchema.body>;
export type UserDto = z.infer<typeof UserSchema>;
