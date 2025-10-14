/**
 * Controlador de usuarios
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del UserService
 * - DRY: Respuestas estandarizadas
 */

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { successResponse, noContentResponse } from '../utils/response';

/**
 * Controlador de usuarios
 */
export class UserController {
  /**
   * GET /users
   * Obtener lista de usuarios con paginación
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : 
                       req.query.isActive === 'false' ? false : 
                       undefined;
      const roleId = req.query.roleId as string | undefined;

      const result = await userService.getUsers({
        page,
        limit,
        search,
        isActive,
        roleId,
      });

      successResponse(res, result.data, 200, {
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id
   * Obtener usuario por ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id
   * Actualizar usuario
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(id, req.body);

      successResponse(res, { user }, 200, {
        message: 'Usuario actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:id
   * Eliminar usuario (soft delete)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/activate
   * Activar usuario
   */
  async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.activateUser(id);

      successResponse(res, { user }, 200, {
        message: 'Usuario activado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id/deactivate
   * Desactivar usuario
   */
  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.deactivateUser(id);

      successResponse(res, { user }, 200, {
        message: 'Usuario desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

