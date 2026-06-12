import { NextFunction, Request, Response } from "express";
import { LoggerService } from "../common/utils/logger.util";
const logger = new LoggerService("Excepciones");

/**
 * Middleware para manejo global de excepciones.
 * Proporciona respuestas de error consistentes y registra información de depuración.
 */
export const manejadorExcepciones = (err: any, req: Request, res: Response, _next: NextFunction) => {
    // Determinar código de estado HTTP y mensaje
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? "Error interno del servidor" : err.message;
    // Crear objeto con información detallada del error para registro
    const detalleError: Record<string, any> = {
        statusCode,
        message: err.message,
        path: req.path,
        method: req.method,
        stack: err.stack,
    };

    if (statusCode === 500) {
        // El detalle/stack solo se registra; NUNCA se devuelve al cliente (independiente del entorno).
        logger.error(`Error 500: ${JSON.stringify(detalleError, null, 2)}`);
    } else {
        logger.debug(`Error ${statusCode}: ${JSON.stringify(detalleError, null, 2)}`);
    }

    // Enviar respuesta al cliente
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        path: detalleError.path,
    });
};
