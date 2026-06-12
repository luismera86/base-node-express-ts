import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const RegistroSchema = {
    body: z
        .object({
            nombre: z.string().openapi({ example: "Juan" }),
            apellido: z.string().openapi({ example: "Pérez" }),
            correo: z.string().email().openapi({ example: "juan@example.com" }),
            contrasena: z.string().min(8).openapi({ example: "secret1234" }),
        })
        .openapi("Registro"),
};

export const IniciarSesionSchema = {
    body: z
        .object({
            correo: z.string().email().openapi({ example: "juan@example.com" }),
            contrasena: z.string().openapi({ example: "secret1234" }),
        })
        .openapi("IniciarSesion"),
};

export const RecuperarContrasenaSchema = {
    body: z
        .object({
            correo: z.string().email().openapi({ example: "juan@example.com" }),
        })
        .openapi("RecuperarContrasena"),
};

export const RestablecerContrasenaSchema = {
    body: z
        .object({
            correo: z.string().email().openapi({ example: "juan@example.com" }),
            token: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
            nueva_contrasena: z.string().min(8).openapi({ example: "newSecret1234" }),
        })
        .openapi("RestablecerContrasena"),
};

export const RefrescarTokenSchema = {
    body: z
        .object({
            token_refresco: z.string().min(1).openapi({ example: "550e8400-...:uuid.uuid" }),
        })
        .openapi("RefrescarToken"),
};

export type RegistroDto = z.infer<typeof RegistroSchema.body>;
export type RefrescarTokenDto = z.infer<typeof RefrescarTokenSchema.body>;
export type IniciarSesionDto = z.infer<typeof IniciarSesionSchema.body>;
export type RecuperarContrasenaDto = z.infer<typeof RecuperarContrasenaSchema.body>;
export type RestablecerContrasenaDto = z.infer<typeof RestablecerContrasenaSchema.body>;
