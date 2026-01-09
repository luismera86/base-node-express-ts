import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateTestSchema = {
    body: z
        .object({
            name: z.string().openapi({ example: "Example Name", description: "Name of test" }),
        })
        .openapi("Test"),
};

export const UpdateTestSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Test id" })),
    }),
    body: CreateTestSchema.body.partial(),
};

export const TestSchema = CreateTestSchema.body.extend({
    id: z.number(),
});

export const DeleteTestSchema = {
    params: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().openapi({ example: 1, description: "Test id" })),
};

export const GetOneTestSchema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Test id" })),
    }),
};

export type CreateTestDto = z.infer<typeof CreateTestSchema.body>;
export type UpdateTestDto = z.infer<typeof UpdateTestSchema.body>;
export type TestSchema = z.infer<typeof TestSchema>;
