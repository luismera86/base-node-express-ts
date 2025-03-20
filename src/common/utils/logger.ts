import { createLogger, format, transports } from "winston";


const { combine, timestamp, printf, colorize } = format;


const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

 export const logger = createLogger({
  level: "debug", // Nivel mínimo de log (puede ser 'error', 'warn', 'info', 'verbose', 'debug', 'silly')
  format: combine(
    colorize(), 
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new transports.Console(), 
    new transports.File({ filename: "logs/error.log", level: "error" }), 
    new transports.File({ filename: "logs/combined.log" }) 
  ]
});

// Si el entorno es de producción, no usamos la consola para los logs
if (process.env.NODE_ENV === "production") {
  logger.remove(new transports.Console());
}


