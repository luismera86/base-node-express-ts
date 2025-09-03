import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateUserSchema = {
    body: z
        .object({
            name: z.string().openapi({ example: "Example Name", description: "Name of user" }),
        })
        .openapi("User"),
};

export const UpdateUserSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "User id" })),
    }),
    body: CreateUserSchema.body.partial(),
};

export const UserSchema = CreateUserSchema.body.extend({
    id: z.number(),
});

export const DeleteUserSchema = {
    params: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().openapi({ example: 1, description: "User id" })),
};

export const GetOneUserSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "User id" })),
    }),
};

export type CreateUserDto = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema.body>;
export type UserSchema = z.infer<typeof UserSchema>;
