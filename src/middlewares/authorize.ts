/**
 * Middleware de autorización por roles
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo verifica permisos
 * - Open/Closed: Extensible para nuevos roles sin modificar código
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { pool } from '../database/connection';

/**
 * Middleware que verifica que el usuario tenga uno de los roles permitidos
 */
export const authorize = (...allowedRoleNames: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const { roleId } = req.user;

      // Obtener el nombre del rol desde la base de datos
      const roleQuery = `
        SELECT name, is_active 
        FROM roles 
        WHERE id = $1
      `;

      const result = await pool.query(roleQuery, [roleId]);

      if (result.rows.length === 0) {
        throw new ForbiddenError('Rol no encontrado');
      }

      const role = result.rows[0];

      // Verificar que el rol esté activo
      if (!role.is_active) {
        throw new ForbiddenError('Rol inactivo');
      }

      // Verificar que el rol esté en la lista de permitidos
      if (!allowedRoleNames.includes(role.name)) {
        throw new ForbiddenError(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoleNames.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware que verifica que el usuario sea administrador
 */
export const requireAdmin = authorize('admin');

/**
 * Middleware que verifica que el usuario sea el propietario del recurso o administrador
 */
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      const resourceUserId = req.params[userIdParam];
      const currentUserId = req.user.userId;

      // Si es el propietario, permitir
      if (resourceUserId === currentUserId) {
        return next();
      }

      // Si no es el propietario, verificar si es admin
      const roleQuery = `
        SELECT name 
        FROM roles 
        WHERE id = $1 AND is_active = true
      `;

      const result = await pool.query(roleQuery, [req.user.roleId]);

      if (result.rows.length === 0 || result.rows[0].name !== 'admin') {
        throw new ForbiddenError('Acceso denegado. Solo el propietario o un administrador puede acceder');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

