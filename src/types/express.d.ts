/**
 * Extensión de tipos de Express para TypeScript
 * 
 * Permite agregar propiedades personalizadas a Request
 * sin perder el type-safety
 */

import { Request } from 'express';

/**
 * Información del usuario autenticado
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

/**
 * Extender la interfaz Request de Express
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Usuario autenticado (disponible después del authMiddleware)
       */
      user?: AuthUser;
    }
  }
}

