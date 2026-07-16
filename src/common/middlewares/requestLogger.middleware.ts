import { randomUUID } from "crypto";
import { pinoHttp } from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import { logger } from "../utils/logger.util";

/**
 * Logging HTTP estructurado con `x-request-id`: cada petición lleva un id que
 * aparece en todos sus logs y en las respuestas de error — permite correlacionar
 * un error reportado con su traza exacta. Si el cliente ya envía `x-request-id`
 * (p. ej. un gateway), se respeta.
 */
export const requestLogger = pinoHttp({
    logger: logger.child({ context: "HTTP" }),
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const requestId = (req.headers["x-request-id"] as string) || randomUUID();
        res.setHeader("x-request-id", requestId);
        return requestId;
    },
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "debug";
    },
    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
        censor: "[Redacted]",
    },
    autoLogging: {
        ignore: (req) => req.url === "/health" || Boolean(req.url?.startsWith("/docs")),
    },
});
