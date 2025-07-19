import { NextFunction, Request, Response } from "express";
import { LoggerService } from "../common/utils/logger.util";
const logger = new LoggerService("Custom Exceptions");

/**
 * Middleware para manejo global de excepciones
 * Proporciona respuestas de error consistentes y registra información de depuración
 */
export const customExceptions = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Determinar código de estado HTTP y mensaje
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  // Crear objeto con información detallada del error para registro
  const errorDetails: Record<string, any> = {
    statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  };

  if (statusCode === 500) {
    logger.error(`Error 500: ${JSON.stringify(errorDetails, null, 2)}`);

    // En producción, ocultar detalles específicos del error
    if (process.env.NODE_ENV === "prod") {
      return res.status(statusCode).json({
        status: "error",
        statusCode,
        message: "Internal server error",
      });
    }
  } else {
    logger.debug(`Error ${statusCode}: ${JSON.stringify(errorDetails, null, 2)}`);
  }

  // Enviar respuesta al cliente
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    path: errorDetails.path,
  });
};
