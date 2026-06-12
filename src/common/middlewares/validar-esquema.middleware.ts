import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

interface EsquemaValidacion {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
}

export const validarEsquema = (esquema: EsquemaValidacion) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (esquema.body) {
                req.body = await esquema.body.parseAsync(req.body);
            }
            if (esquema.params) {
                req.params = (await esquema.params.parseAsync(req.params)) as typeof req.params;
            }
            if (esquema.query) {
                req.query = (await esquema.query.parseAsync(req.query)) as typeof req.query;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: "error",
                    message: "Error de validación",
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
