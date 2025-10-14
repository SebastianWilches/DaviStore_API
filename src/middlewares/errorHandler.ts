/**
 * Middleware de manejo centralizado de errores
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja errores
 * - Clean Code: Respuestas de error consistentes
 * - DRY: Un solo lugar para formatear errores
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware registrado
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  // Log del error
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    path: req.path,
    error: err.stack,
  });

  // Si es un error conocido (AppError)
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.code, err.details);
  }

  // Error de PostgreSQL
  if ('code' in err && typeof err.code === 'string') {
    return handleDatabaseError(err, res);
  }

  // Error desconocido (500)
  const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;

  return errorResponse(res, message, 500, 'INTERNAL_SERVER_ERROR', {
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
};

/**
 * Manejo específico de errores de PostgreSQL
 */
const handleDatabaseError = (err: Error & { code?: string; detail?: string }, res: Response): Response => {
  const pgError = err as { code: string; detail?: string };

  switch (pgError.code) {
    case '23505': // unique_violation
      return errorResponse(res, 'Resource already exists', 409, 'DUPLICATE_ENTRY', {
        detail: pgError.detail,
      });

    case '23503': // foreign_key_violation
      return errorResponse(res, 'Referenced resource does not exist', 400, 'FOREIGN_KEY_VIOLATION', {
        detail: pgError.detail,
      });

    case '23502': // not_null_violation
      return errorResponse(res, 'Required field is missing', 400, 'NOT_NULL_VIOLATION', {
        detail: pgError.detail,
      });

    case '22P02': // invalid_text_representation
      return errorResponse(res, 'Invalid data format', 400, 'INVALID_FORMAT');

    case '23514': // check_violation
      return errorResponse(res, 'Data validation failed', 400, 'CHECK_VIOLATION', {
        detail: pgError.detail,
      });

    default:
      return errorResponse(res, 'Database error', 500, 'DATABASE_ERROR');
  }
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
};

