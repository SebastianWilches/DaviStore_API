/**
 * Rutas de órdenes
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de órdenes
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { orderController } from '../controllers/OrderController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  createOrderValidation,
  updateOrderStatusValidation,
  orderIdValidation,
  getOrdersQueryValidation,
} from '../validations/orderValidations';

const router = Router();

// Todas las rutas de órdenes requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/v1/orders
 * @desc    Obtener órdenes del usuario actual o todas (admin)
 * @access  Private
 */
router.get(
  '/',
  validate(getOrdersQueryValidation),
  orderController.getOrders.bind(orderController)
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  validate(orderIdValidation),
  orderController.getOrderById.bind(orderController)
);

/**
 * @route   POST /api/v1/orders
 * @desc    Crear nueva orden (checkout)
 * @access  Private
 */
router.post(
  '/',
  validate(createOrderValidation),
  orderController.createOrder.bind(orderController)
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Actualizar estado de orden
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  requireAdmin,
  validate(updateOrderStatusValidation),
  orderController.updateOrderStatus.bind(orderController)
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancelar orden
 * @access  Private (Owner)
 */
router.post(
  '/:id/cancel',
  validate(orderIdValidation),
  orderController.cancelOrder.bind(orderController)
);

export default router;

