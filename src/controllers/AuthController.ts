/**
 * Controlador de autenticación
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del AuthService
 * - DRY: Respuestas estandarizadas
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { successResponse } from '../utils/response';

/**
 * Controlador de autenticación
 */
export class AuthController {
  /**
   * POST /auth/register
   * Registrar un nuevo usuario
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);

      successResponse(res, result, 201, {
        message: 'Usuario registrado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Iniciar sesión
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);

      successResponse(res, result, 200, {
        message: 'Inicio de sesión exitoso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refrescar access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      successResponse(res, { tokens }, 200, {
        message: 'Token refrescado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   * Obtener usuario actual
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // El middleware authenticate ya verificó el token
      const userId = req.user!.userId;
      const user = await authService.getCurrentUser(userId);

      successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Cerrar sesión (principalmente para documentación, el logout real es client-side)
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // En un sistema JWT, el logout se maneja en el cliente eliminando los tokens
      // Aquí solo retornamos una respuesta de éxito
      // En el futuro se podría implementar una blacklist de tokens

      successResponse(res, { message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

