import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { DEFAULT_LANG, t } from "../i18n/i18n.util";

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
                req.params = (await schema.params.parseAsync(req.params)) as typeof req.params;
            }
            if (schema.query) {
                req.query = (await schema.query.parseAsync(req.query)) as typeof req.query;
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const lang = req.lang ?? DEFAULT_LANG;
                return res.status(400).json({
                    statusCode: 400,
                    error: "Bad Request",
                    message: t("errors.VALIDATION_ERROR", lang),
                    errors: error.issues.map((err) => ({
                        path: err.path.join("."),
                        message: err.message.startsWith("errors.") ? t(err.message, lang) : err.message,
                    })),
                    path: req.originalUrl,
                    timestamp: new Date().toISOString(),
                    requestId: req.id,
                });
            }
            next(error);
        }
    };
};
