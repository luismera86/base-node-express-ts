import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

interface ValidationSchema {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export class SchemaValidator {
  private schema: ValidationSchema;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  public static validateSchema(schema: ValidationSchema) {
    return new SchemaValidator(schema).validate();
  }

  public validate() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (this.schema.body) {
          req.body = await this.schema.body.parseAsync(req.body);
        }
        if (this.schema.params) {
          req.params = await this.schema.params.parseAsync(req.params);
        }
        if (this.schema.query) {
          req.query = await this.schema.query.parseAsync(req.query);
        }
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            status: "error",
            message: "Error de validación",
            errors: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          });
        }
        next(error);
      }
    };
  }
}
