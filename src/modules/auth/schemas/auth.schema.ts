import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const RegisterSchema = {
    body: z
        .object({
            first_name: z.string().openapi({ example: "Juan" }),
            last_name: z.string().openapi({ example: "Pérez" }),
            email: z.string().email().openapi({ example: "juan@example.com" }),
            password: z.string().min(8).openapi({ example: "secret1234" }),
        })
        .openapi("Register"),
};

export const LoginSchema = {
    body: z
        .object({
            email: z.string().email().openapi({ example: "juan@example.com" }),
            password: z.string().openapi({ example: "secret1234" }),
        })
        .openapi("Login"),
};

export const ForgotPasswordSchema = {
    body: z
        .object({
            email: z.string().email().openapi({ example: "juan@example.com" }),
        })
        .openapi("ForgotPassword"),
};

export const ResetPasswordSchema = {
    body: z
        .object({
            email: z.string().email().openapi({ example: "juan@example.com" }),
            token: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
            new_password: z.string().min(8).openapi({ example: "newSecret1234" }),
        })
        .openapi("ResetPassword"),
};

export type RegisterDto = z.infer<typeof RegisterSchema.body>;
export type LoginDto = z.infer<typeof LoginSchema.body>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema.body>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema.body>;
