import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extender Zod con OpenAPI
extendZodWithOpenApi(z);

export const GetByIdUuidSchema = {
    params: z.object({
        id: z
            .string()
            .uuid()
            .openapi({ example: "123e4567-e89b-12d3-a456-426614174000", description: "Id of the entity" }),
    }),
};

export type GetByIdUuidSchema = z.infer<typeof GetByIdUuidSchema.params>;
