/**
 * Logger personalizado
 * 
 * Proporciona logging estructurado con niveles
 */

import { config } from '../config/env';

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * Clase Logger
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();

    const logObject: { timestamp: string; level: LogLevel; message: string; meta?: unknown } = {
      timestamp,
      level,
      message,
    };

    if (meta !== undefined) {
      logObject.meta = meta;
    }

    // En desarrollo: output formateado
    // En producción: JSON para herramientas de logging
    if (this.isDevelopment) {
      const color = this.getColor(level);
      console.log(`${color}[${timestamp}] ${level}${this.reset}: ${message}`);
      if (meta) {
        console.log(meta);
      }
    } else {
      console.log(JSON.stringify(logObject));
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return '\x1b[31m'; // Rojo
      case LogLevel.WARN:
        return '\x1b[33m'; // Amarillo
      case LogLevel.INFO:
        return '\x1b[36m'; // Cyan
      case LogLevel.DEBUG:
        return '\x1b[90m'; // Gris
      default:
        return '';
    }
  }

  private get reset(): string {
    return '\x1b[0m';
  }

  error(message: string, meta?: unknown): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
}

export const logger = new Logger();
export default logger;

