import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CrearUsuarioSchema = {
    body: z
        .object({
            nombre: z.string().openapi({ example: "Juan", description: "Nombre del usuario" }),
            apellido: z.string().openapi({ example: "Pérez", description: "Apellido del usuario" }),
            correo: z.string().email().openapi({ example: "juan@example.com", description: "Correo del usuario" }),
            contrasena: z
                .string()
                .min(8)
                .openapi({ example: "secret1234", description: "Contraseña (mín. 8 caracteres)" }),
            rol: z.string().optional().openapi({ example: "user", description: "Rol del usuario" }),
        })
        .openapi("Usuario"),
};

// Actualización por administrador: permite cambiar el rol.
export const ActualizarUsuarioSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
    body: CrearUsuarioSchema.body.omit({ contrasena: true }).partial(),
};

// Actualización propia (no-admin): NO permite cambiar el rol.
export const ActualizarUsuarioPropioSchema = {
    params: ActualizarUsuarioSchema.params,
    body: CrearUsuarioSchema.body.omit({ contrasena: true, rol: true }).partial(),
};

// Schema de salida: NO incluye campos sensibles (contrasena, token_recuperacion,
// token_recuperacion_expira_en, token_refresco) — coherente con el `omit` global de Prisma.
export const UsuarioSchema = CrearUsuarioSchema.body.omit({ contrasena: true }).extend({
    id: z.string().uuid(),
    activo: z.boolean(),
    creado_en: z.date(),
    actualizado_en: z.date(),
    eliminado_en: z.date().nullable(),
});

export const EliminarUsuarioSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
};

export const ObtenerUsuarioSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del usuario" }),
    }),
};

export type CrearUsuarioDto = z.infer<typeof CrearUsuarioSchema.body>;
export type ActualizarUsuarioDto = z.infer<typeof ActualizarUsuarioSchema.body>;
export type ActualizarUsuarioPropioDto = z.infer<typeof ActualizarUsuarioPropioSchema.body>;
export type UsuarioDto = z.infer<typeof UsuarioSchema>;
