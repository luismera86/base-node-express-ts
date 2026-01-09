import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const CreateTest2Schema = {
    body: z
        .object({
            name: z.string().openapi({ example: "Example Name", description: "Name of test2" }),
        })
        .openapi("Test2"),
};

export const UpdateTest2Schema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Test2 id" })),
    }),
    body: CreateTest2Schema.body.partial(),
};

export const Test2Schema = CreateTest2Schema.body.extend({
    id: z.number(),
});

export const DeleteTest2Schema = {
    params: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int().positive().openapi({ example: 1, description: "Test2 id" })),
};

export const GetOneTest2Schema = {
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .pipe(z.number().int().positive().openapi({ example: 1, description: "Test2 id" })),
    }),
};

export type CreateTest2Dto = z.infer<typeof CreateTest2Schema.body>;
export type UpdateTest2Dto = z.infer<typeof UpdateTest2Schema.body>;
export type Test2Schema = z.infer<typeof Test2Schema>;
