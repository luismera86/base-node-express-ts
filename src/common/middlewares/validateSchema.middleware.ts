import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

interface ValidationSchema {
    body?: AnyZodObject;
    params?: AnyZodObject;
    query?: AnyZodObject;
}

export const validateSchema = (schema: ValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: "error",
                    message: "Validation error",
                    errors: error.errors.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
