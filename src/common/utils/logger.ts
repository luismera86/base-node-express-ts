// utils/logger.ts
import { createLogger, format, transports } from 'winston';
import chalk from 'chalk';
import path from 'path';

const logDir = path.join(__dirname, '..', 'logs');

// Definir niveles personalizados
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4,
    silly: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'magenta',
    silily: 'cyan'
  }
};

// Determinar el nivel de logging basado en el entorno
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'error' : 'debug';
};

const nestFormat = format.printf(({ level, message, timestamp, context }) => {
  // Separar el mensaje principal y el secundario si existe
  const [mainMessage, subMessage] = (message as string).split('\n');
  
  const mainLine = `${timestamp} ${level.toUpperCase()} [${context || 'Application'}] ${mainMessage}`;
  
  const colorizer = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.green,
    debug: chalk.blue,
    verbose: chalk.magenta,
    silly: chalk.cyan
  }[level] || chalk.white;

  // Si hay un mensaje secundario, agregarlo en blanco
  return subMessage 
    ? `${colorizer(mainLine)}\n${chalk.white(subMessage)}`
    : colorizer(mainLine);
});

export const logger = createLogger({
  levels: customLevels.levels,
  level: getLogLevel(),
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

  info(message: string, subMessage?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
    logger.log('info', { message: fullMessage, context: this.context });
  }

  error(message: string, subMessage?: string, trace?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}${trace ? '\n' + trace : ''}` : `${message}${trace ? ' - ' + trace : ''}`;
    logger.error('error:', { message: fullMessage, context: this.context });
  }

  warn(message: string, subMessage?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
    logger.warn('warn', { message: fullMessage, context: this.context });
  }

  debug(message: string, subMessage?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
    logger.debug('debug', { message: fullMessage, context: this.context });
  }

  verbose(message: string, subMessage?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
    logger.verbose('verbose', { message: fullMessage, context: this.context });
  }

  silly(message: string, subMessage?: string) {
    const fullMessage = subMessage ? `${message}\n${subMessage}` : message;
    logger.silly('silly', { message: fullMessage, context: this.context });
  }
}
