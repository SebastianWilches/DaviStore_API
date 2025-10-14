/**
 * Middleware de validación usando express-validator
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida requests
 * - DRY: Validación reutilizable
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Middleware que ejecuta validaciones y retorna errores
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Obtener errores
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Formatear errores
    const formattedErrors = errors.array().map((error) => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined,
    }));

    next(new ValidationError('Validation failed', formattedErrors));
  };
};

