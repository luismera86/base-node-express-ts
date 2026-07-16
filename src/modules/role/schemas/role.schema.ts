import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { PaginationQuerySchema } from "../../../common/schemas/pagination.schema";

extendZodWithOpenApi(z);

const roleIdParam = z.object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID del rol" }),
});

export const GetAllRolesSchema = {
    query: PaginationQuerySchema,
};

export const CreateRoleSchema = {
    body: z
        .object({
            // Nombre normalizado: requireRole compara por nombre exacto.
            name: z
                .string()
                .trim()
                .toLowerCase()
                .min(1)
                .max(50)
                .openapi({ example: "editor", description: "Nombre único del rol (minúsculas)" }),
            description: z
                .string()
                .max(255)
                .optional()
                .openapi({ example: "Puede editar contenido", description: "Descripción del rol" }),
        })
        .openapi("Role"),
};

export const UpdateRoleSchema = {
    params: roleIdParam,
    body: CreateRoleSchema.body.partial(),
};

export const GetOneRoleSchema = {
    params: roleIdParam,
};

export const DeleteRoleSchema = {
    params: roleIdParam,
};

// Schema de salida para la documentación.
export const RoleSchema = CreateRoleSchema.body.extend({
    id: z.string().uuid(),
    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().nullable(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema.body>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema.body>;
export type RoleDto = z.infer<typeof RoleSchema>;
