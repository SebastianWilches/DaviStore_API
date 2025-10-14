/**
 * Utilidades para respuestas HTTP estandarizadas
 * 
 * Principios aplicados:
 * - DRY: Formato de respuesta consistente
 * - Clean Code: Respuestas claras y predecibles
 */

import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Respuesta exitosa
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): Response => {
  const errorObj: { message: string; code?: string; details?: unknown } = {
    message,
  };

  if (code) {
    errorObj.code = code;
  }

  if (details !== undefined) {
    errorObj.details = details;
  }

  const response: ApiResponse = {
    success: false,
    error: errorObj,
  };

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de recurso creado
 */
export const createdResponse = <T>(res: Response, data: T): Response => {
  return successResponse(res, data, 201);
};

/**
 * Respuesta sin contenido (204)
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

