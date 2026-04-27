import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

interface ValidationSchema {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
}

export const validateSchema = (schema: ValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params) as typeof req.params;
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query) as typeof req.query;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: "error",
                    message: "Validation error",
                    errors: error.issues.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                });
            }
            next(error);
        }
    };
};
