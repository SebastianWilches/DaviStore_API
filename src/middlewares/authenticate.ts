/**
 * Middleware de autenticación
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo verifica autenticación
 * - Security: Valida JWT en cada request
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

/**
 * Extender la interfaz Request para incluir user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware que verifica que el usuario esté autenticado
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    // Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verificar y decodificar token
    const payload = verifyAccessToken(token);

    // Agregar usuario al request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional de autenticación
 * No lanza error si no hay token, solo lo agrega si existe
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const payload = verifyAccessToken(token);
        req.user = payload;
      }
    }

    next();
  } catch {
    // Si hay error, simplemente continuar sin usuario
    next();
  }
};

