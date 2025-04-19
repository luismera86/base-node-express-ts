// utils/logger.ts
import { createLogger, format, transports } from 'winston';
import chalk from 'chalk';
import path from 'path';

const logDir = path.join(__dirname, '..', 'logs');

const nestFormat = format.printf(({ level, message, timestamp, context }) => {
  const fullMessage = `${timestamp} ${level.toUpperCase()} [${context || 'Application'}] ${message}`;

  const colorizer = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.green,
    debug: chalk.blue,
    verbose: chalk.magenta,
  }[level] || chalk.white;

  return colorizer(fullMessage);
});

export const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    nestFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
  ],
});

export class LoggerService {
  constructor(private context = 'App') {}

  log(message: string) {
    logger.info({ message, context: this.context });
  }

  error(message: string, trace?: string) {
    logger.error({ message: `${message}${trace ? ' - ' + trace : ''}`, context: this.context });
  }

  warn(message: string) {
    logger.warn({ message, context: this.context });
  }

  debug(message: string) {
    logger.debug({ message, context: this.context });
  }

  verbose(message: string) {
    logger.verbose({ message, context: this.context });
  }
}
