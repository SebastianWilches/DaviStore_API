/**
 * Controlador de carrito
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del CartService
 */

import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/CartService';
import { successResponse } from '../utils/response';

/**
 * Controlador de carrito
 */
export class CartController {
  /**
   * GET /cart
   * Obtener carrito del usuario actual
   */
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await cartService.getOrCreateCart(userId);

      successResponse(res, { cart });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /cart/summary
   * Obtener resumen del carrito
   */
  async getCartSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const summary = await cartService.getCartSummary(userId);

      successResponse(res, { summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cart/items
   * Agregar producto al carrito
   */
  async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await cartService.addToCart(userId, req.body);

      successResponse(res, { cart }, 200, {
        message: 'Producto agregado al carrito',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /cart/items/:itemId
   * Actualizar cantidad de un item
   */
  async updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const cart = await cartService.updateCartItem(userId, itemId, req.body);

      successResponse(res, { cart }, 200, {
        message: 'Cantidad actualizada',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart/items/:itemId
   * Eliminar item del carrito
   */
  async removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const cart = await cartService.removeFromCart(userId, itemId);

      successResponse(res, { cart }, 200, {
        message: 'Producto eliminado del carrito',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cart
   * Vaciar carrito
   */
  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await cartService.clearCart(userId);

      successResponse(res, { cart }, 200, {
        message: 'Carrito vaciado',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();

