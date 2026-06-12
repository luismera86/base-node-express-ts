import { Temporal } from "@js-temporal/polyfill";
import path from "path";
import { createLogger, format, transports } from "winston";

const { combine, printf, colorize } = format;

const logDir = path.join(__dirname, "../../../", "logs");

const formatoPersonalizado = printf(({ level, message, context }) => {
    const timestamp = Temporal.Now.zonedDateTimeISO("America/Argentina/Buenos_Aires")
        .toPlainDateTime()
        .toString()
        .slice(0, 19)
        .replace("T", " ");
    return `${timestamp} [${level}] [${context || "Aplicacion"}]: ${message}`;
});

export const logger = createLogger({
    level: "debug",
    format: combine(colorize(), formatoPersonalizado),
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

    info(mensaje: string, subMensaje?: string) {
        const mensajeCompleto = subMensaje ? `${mensaje}\n${subMensaje}` : mensaje;
        logger.info(mensajeCompleto, { context: this.context });
    }

    error(mensaje: string, subMensaje?: string, traza?: string) {
        const mensajeCompleto = subMensaje
            ? `${mensaje}\n${subMensaje}${traza ? "\n" + traza : ""}`
            : `${mensaje}${traza ? " - " + traza : ""}`;
        logger.error(mensajeCompleto, { context: this.context });
    }

    warn(mensaje: string, subMensaje?: string) {
        const mensajeCompleto = subMensaje ? `${mensaje}\n${subMensaje}` : mensaje;
        logger.warn(mensajeCompleto, { context: this.context });
    }

    debug(mensaje: string, subMensaje?: string) {
        const mensajeCompleto = subMensaje ? `${mensaje}\n${subMensaje}` : mensaje;
        logger.debug(mensajeCompleto, { context: this.context });
    }

    verbose(mensaje: string, subMensaje?: string) {
        const mensajeCompleto = subMensaje ? `${mensaje}\n${subMensaje}` : mensaje;
        logger.verbose(mensajeCompleto, { context: this.context });
    }

    silly(mensaje: string, subMensaje?: string) {
        const mensajeCompleto = subMensaje ? `${mensaje}\n${subMensaje}` : mensaje;
        logger.silly(mensajeCompleto, { context: this.context });
    }
}
