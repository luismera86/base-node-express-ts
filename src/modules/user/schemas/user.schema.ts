import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateUserSchema = {
    body: z
        .object({
            firstName: z.string().openapi({ example: "Example Name", description: "Name of user" }),
            lastName: z.string().openapi({ example: "Example Name", description: "Name of user" }),
            email: z.string().email().openapi({ example: "example@example.com", description: "Email of user" }),
            password: z.string().min(8).openapi({ example: "Password123", description: "Password of user" }),
        })
        .openapi("User"),
};

export const UpdateUserSchema = {
    params: z.object({
        id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User id" }),
    }),
    body: CreateUserSchema.body.partial(),
};

export const UserSchema = CreateUserSchema.body.extend({
    id: z.string(),
});

export const DeleteUserSchema = {
    params: z.object({
        id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000", description: "User id" }),
    }),
};

export const GetOneUserSchema = {
    params: z.object({
        id: z.string(),
    }),
};

export type CreateUserDto = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema.body>;
export type UserSchema = z.infer<typeof UserSchema>;
