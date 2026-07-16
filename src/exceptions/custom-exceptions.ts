import { NextFunction, Request, Response } from "express";
import { LoggerService } from "../common/utils/logger.util";
import { DEFAULT_LANG, isTranslationKey, t } from "../common/i18n/i18n.util";

const logger = new LoggerService("ExceptionsFilter");

const STATUS_TEXT: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    408: "Request Timeout",
    409: "Conflict",
    411: "Length Required",
    413: "Payload Too Large",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    503: "Service Unavailable",
    504: "Gateway Timeout",
};

/**
 * Errores conocidos de Prisma → HTTP correcto. P. ej., la carrera de dos
 * registros simultáneos con el mismo email responde 409, no 500.
 */
const PRISMA_ERROR_MAP: Record<string, { statusCode: number; messageKey: string }> = {
    P2002: { statusCode: 409, messageKey: "errors.DUPLICATE_RESOURCE" }, // unique constraint
    P2003: { statusCode: 409, messageKey: "errors.RELATED_RESOURCE_CONFLICT" }, // FK constraint
    P2025: { statusCode: 404, messageKey: "errors.NOT_FOUND" }, // registro no encontrado
    P2023: { statusCode: 400, messageKey: "errors.INVALID_ID" }, // id malformado (uuid inválido)
};

/**
 * Manejo global de excepciones: formato de respuesta uniforme con `requestId`,
 * mensajes traducidos al idioma del request y sin stack traces ni detalles
 * internos hacia el cliente.
 */
export const customExceptions = (err: any, req: Request, res: Response, _next: NextFunction) => {
    let statusCode: number = err.statusCode || 0;
    let message: string = err.message || "errors.INTERNAL_SERVER_ERROR";

    // Errores de Prisma (duck-typing sobre err.code para no acoplarse al runtime del client).
    if (!statusCode && typeof err.code === "string" && PRISMA_ERROR_MAP[err.code]) {
        ({ statusCode, messageKey: message } = PRISMA_ERROR_MAP[err.code]);
    }

    // Errores del body-parser: body demasiado grande o JSON malformado.
    if (err.type === "entity.too.large") statusCode = 413;
    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "errors.VALIDATION_ERROR";
    }

    if (!statusCode) statusCode = 500;
    // Los 500 nunca filtran el mensaje interno al cliente.
    if (statusCode >= 500) message = "errors.INTERNAL_SERVER_ERROR";

    const lang = req.lang ?? DEFAULT_LANG;
    const translated = isTranslationKey(message) ? t(message, lang) : message;

    const errorDetails = {
        statusCode,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        requestId: req.id,
        stack: err.stack,
    };

    if (statusCode >= 500) {
        // El detalle/stack solo se registra; NUNCA se devuelve al cliente (independiente del entorno).
        logger.error(`Error ${statusCode}: ${JSON.stringify(errorDetails, null, 2)}`);
    } else {
        logger.debug(`Error ${statusCode}: ${JSON.stringify(errorDetails, null, 2)}`);
    }

    res.status(statusCode).json({
        statusCode,
        error: STATUS_TEXT[statusCode] ?? "Error",
        message: translated,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        requestId: req.id,
    });
};
