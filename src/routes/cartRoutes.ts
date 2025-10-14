/**
 * Rutas de carrito
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de carrito
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { cartController } from '../controllers/CartController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import {
  addToCartValidation,
  updateCartItemValidation,
  removeFromCartValidation,
} from '../validations/cartValidations';

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/v1/cart
 * @desc    Obtener carrito del usuario actual
 * @access  Private
 */
router.get(
  '/',
  cartController.getCart.bind(cartController)
);

/**
 * @route   GET /api/v1/cart/summary
 * @desc    Obtener resumen del carrito
 * @access  Private
 */
router.get(
  '/summary',
  cartController.getCartSummary.bind(cartController)
);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Agregar producto al carrito
 * @access  Private
 */
router.post(
  '/items',
  validate(addToCartValidation),
  cartController.addToCart.bind(cartController)
);

/**
 * @route   PUT /api/v1/cart/items/:itemId
 * @desc    Actualizar cantidad de un item
 * @access  Private
 */
router.put(
  '/items/:itemId',
  validate(updateCartItemValidation),
  cartController.updateCartItem.bind(cartController)
);

/**
 * @route   DELETE /api/v1/cart/items/:itemId
 * @desc    Eliminar item del carrito
 * @access  Private
 */
router.delete(
  '/items/:itemId',
  validate(removeFromCartValidation),
  cartController.removeFromCart.bind(cartController)
);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Vaciar carrito
 * @access  Private
 */
router.delete(
  '/',
  cartController.clearCart.bind(cartController)
);

export default router;

