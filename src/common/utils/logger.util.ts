import path from "path";
import pino from "pino";
import pretty from "pino-pretty";
import { createStream } from "rotating-file-stream";
import envConfig from "../../config/env.config";

const logDir = path.join(__dirname, "../../../", "logs");

const isTest = Boolean(process.env.VITEST);
const isProd = envConfig.NODE_ENV === "prod";

/**
 * Archivos con rotación: diaria o al superar 20 MB, comprimidos con gzip.
 * Los más viejos se borran solos (retención en `maxFiles`).
 */
const rotatingFile = (filename: string, maxFiles: number) =>
    createStream(filename, {
        path: logDir,
        interval: "1d",
        size: "20M",
        compress: "gzip",
        maxFiles,
    });

const buildDestinations = (): pino.StreamEntry[] => {
    const streams: pino.StreamEntry[] = [];

    // Archivos: todo desde debug en combined, solo errores en error.log (nunca en tests).
    if (!isTest) {
        streams.push({ level: "debug", stream: rotatingFile("combined.log", 14) });
        streams.push({ level: "error", stream: rotatingFile("error.log", 30) });
    }

    if (isProd) {
        // Consola JSON en producción (para docker / orquestadores).
        streams.push({ level: envConfig.LOG_LEVEL, stream: process.stdout });
    } else {
        // Consola legible en desarrollo.
        streams.push({
            level: envConfig.LOG_LEVEL,
            stream: pretty({
                colorize: true,
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
                messageFormat: "[{context}] {msg}",
                ignore: "pid,hostname,context",
                sync: true,
            }),
        });
    }

    return streams;
};

export const logger = pino(
    {
        level: "debug",
        timestamp: pino.stdTimeFunctions.isoTime,
        base: undefined,
        redact: {
            paths: ["password", "*.password", "refresh_token", "*.refresh_token", "authorization", "cookie"],
            censor: "[Redacted]",
        },
    },
    pino.multistream(buildDestinations()),
);

export class LoggerService {
    private readonly child: pino.Logger;

    constructor(context = "App") {
        this.child = logger.child({ context });
    }

    private compose(message: string, subMessage?: string, trace?: string) {
        let full = subMessage ? `${message} — ${subMessage}` : message;
        if (trace) full += `\n${trace}`;
        return full;
    }

    info(message: string, subMessage?: string) {
        this.child.info(this.compose(message, subMessage));
    }

    error(message: string, subMessage?: string, trace?: string) {
        this.child.error(this.compose(message, subMessage, trace));
    }

    warn(message: string, subMessage?: string) {
        this.child.warn(this.compose(message, subMessage));
    }

    debug(message: string, subMessage?: string) {
        this.child.debug(this.compose(message, subMessage));
    }

    verbose(message: string, subMessage?: string) {
        this.child.debug(this.compose(message, subMessage));
    }

    silly(message: string, subMessage?: string) {
        this.child.trace(this.compose(message, subMessage));
    }
}
