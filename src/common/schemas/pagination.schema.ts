import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

/**
 * Paginación estándar para todos los listados: `?page=2&limit=20&order=desc`.
 * `limit` con tope 100, valores validados y con defaults.
 */
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
    limit: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
    order: z.enum(["asc", "desc"]).default("desc").openapi({ example: "desc" }),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;

/** Respuesta uniforme de los listados paginados. */
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export const paginate = <T>(items: T[], total: number, query: PaginationQueryDto): Paginated<T> => ({
    items,
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
});

/** Offset a usar en `skip` de Prisma. */
export const skipOf = (query: PaginationQueryDto): number => (query.page - 1) * query.limit;
