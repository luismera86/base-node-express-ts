import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extender Zod con OpenAPI
extendZodWithOpenApi(z);

export const GetByIdNumberSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Id of the entity" })),
    }),
};

export type GetByIdNumberSchema = z.infer<typeof GetByIdNumberSchema.params>;
