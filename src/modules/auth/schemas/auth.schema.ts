import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { strongPasswordSchema } from "../../../common/schemas/strong-password.schema";

extendZodWithOpenApi(z);

export const RegisterSchema = {
    body: z
        .object({
            first_name: z.string().min(1).openapi({ example: "Juan" }),
            last_name: z.string().min(1).openapi({ example: "Pérez" }),
            email: z.string().email().openapi({ example: "juan@example.com" }),
            password: strongPasswordSchema.openapi({ example: "Secret1234!" }),
        })
        .openapi("Register"),
};

export const VerifyEmailSchema = {
    body: z
        .object({
            token: z.string().min(1).openapi({ example: "a3f8…64-hex-chars…" }),
        })
        .openapi("VerifyEmail"),
};

export const ResendVerificationSchema = {
    body: z
        .object({
            email: z.string().email().openapi({ example: "juan@example.com" }),
        })
        .openapi("ResendVerification"),
};

export const LoginSchema = {
    body: z
        .object({
            email: z.string().email().openapi({ example: "juan@example.com" }),
            // Sin política de fuerza acá: solo tipo y longitud máxima, para no
            // rechazar credenciales creadas antes de un cambio de reglas.
            password: z.string().min(1).max(128).openapi({ example: "Secret1234!" }),
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
            // El token identifica al usuario por sí solo (lookup por hash SHA-256).
            token: z.string().min(1).openapi({ example: "a3f8…64-hex-chars…" }),
            new_password: strongPasswordSchema.openapi({ example: "NewSecret1234!" }),
        })
        .openapi("ResetPassword"),
};

export const RefreshTokenSchema = {
    // El refresh viaja normalmente en su cookie httpOnly; el body es un
    // fallback opcional para clientes API que no manejan cookies.
    body: z
        .object({
            refresh_token: z.string().min(1).optional().openapi({ example: "eyJhbGciOiJIUzI1NiJ9..." }),
        })
        .openapi("RefreshToken"),
};

export type RegisterDto = z.infer<typeof RegisterSchema.body>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema.body>;
export type ResendVerificationDto = z.infer<typeof ResendVerificationSchema.body>;
export type LoginDto = z.infer<typeof LoginSchema.body>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema.body>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema.body>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema.body>;
