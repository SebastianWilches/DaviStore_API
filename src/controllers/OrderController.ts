/**
 * Controlador de órdenes
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del OrderService
 */

import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/OrderService';
import { successResponse } from '../utils/response';
import { OrderStatus } from '../types';
import { pool } from '../database/connection';

/**
 * Controlador de órdenes
 */
export class OrderController {
  /**
   * POST /orders (checkout)
   * Crear nueva orden desde el carrito
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const order = await orderService.createOrder(userId, req.body);

      successResponse(res, { order }, 201, {
        message: 'Orden creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders
   * Obtener órdenes del usuario actual o todas (admin)
   */
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const roleId = req.user!.roleId;

      // Verificar si es admin
      const roleResult = await pool.query(
        'SELECT name FROM roles WHERE id = $1',
        [roleId]
      );

      const isAdmin = roleResult.rows.length > 0 && roleResult.rows[0].name === 'admin';

      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const status = req.query.status as OrderStatus | undefined;

      // Si no es admin, solo puede ver sus propias órdenes
      const queryUserId = isAdmin ? (req.query.userId as string | undefined) : userId;

      const result = await orderService.getOrders({
        page,
        limit,
        status,
        userId: queryUserId,
      });

      successResponse(res, result.data, 200, {
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/:id
   * Obtener orden por ID
   */
  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const roleId = req.user!.roleId;
      const { id } = req.params;

      // Verificar si es admin
      const roleResult = await pool.query(
        'SELECT name FROM roles WHERE id = $1',
        [roleId]
      );

      const isAdmin = roleResult.rows.length > 0 && roleResult.rows[0].name === 'admin';

      // Admin puede ver cualquier orden, usuario normal solo la suya
      const order = await orderService.getOrderById(id, isAdmin ? undefined : userId);

      successResponse(res, { order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /orders/:id/status (Admin)
   * Actualizar estado de orden
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.updateOrderStatus(id, req.body);

      successResponse(res, { order }, 200, {
        message: 'Estado de orden actualizado',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /orders/:id/cancel
   * Cancelar orden (Usuario)
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const order = await orderService.cancelOrder(id, userId);

      successResponse(res, { order }, 200, {
        message: 'Orden cancelada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();

