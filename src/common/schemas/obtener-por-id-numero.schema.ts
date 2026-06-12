import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extender Zod con OpenAPI
extendZodWithOpenApi(z);

export const ObtenerPorIdNumeroSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Id de la entidad" })),
    }),
};

export type ObtenerPorIdNumeroSchema = z.infer<typeof ObtenerPorIdNumeroSchema.params>;
