import { Temporal } from "@js-temporal/polyfill";
import path from "path";
import { createLogger, format, transports } from "winston";

const { combine, printf, colorize } = format;

const logDir = path.join(__dirname, "../../../", "logs");

const customFormat = printf(({ level, message, context }) => {
    const timestamp = Temporal.Now.zonedDateTimeISO("America/Argentina/Buenos_Aires")
        .toPlainDateTime()
        .toString()
        .slice(0, 19)
        .replace("T", " ");
    return `${timestamp} [${level}] [${context || "Application"}]: ${message}`;
});

export const logger = createLogger({
    level: "debug",
    format: combine(colorize(), customFormat),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        new transports.File({ filename: path.join(logDir, "combined.log") }),
    ],
});

// Si el entorno es de producción, no usamos la consola para los logs
if (process.env.NODE_ENV === "prod") {
    logger.remove(new transports.Console());
}

export class LoggerService {
    constructor(private context = "App") {}

    info(message: string, subMessage?: string) {
        const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
        logger.info(fullMessage, { context: this.context });
    }

    error(message: string, subMessage?: string, trace?: string) {
        const fullMessage = subMessage
            ? `${message}\n${subMessage}${trace ? "\n" + trace : ""}`
            : `${message}${trace ? " - " + trace : ""}`;
        logger.error(fullMessage, { context: this.context });
    }

    warn(message: string, subMessage?: string) {
        const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
        logger.warn(fullMessage, { context: this.context });
    }

    debug(message: string, subMessage?: string) {
        const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
        logger.debug(fullMessage, { context: this.context });
    }

    verbose(message: string, subMessage?: string) {
        const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
        logger.verbose(fullMessage, { context: this.context });
    }

    silly(message: string, subMessage?: string) {
        const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
        logger.silly(fullMessage, { context: this.context });
    }
}
