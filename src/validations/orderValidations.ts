/**
 * Validaciones para rutas de órdenes
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida datos de entrada
 * - DRY: Validaciones reutilizables
 */

import { body, param, query } from 'express-validator';
import { OrderStatus, PaymentMethod } from '../types';

/**
 * Validación para crear orden (checkout)
 */
export const createOrderValidation = [
  body('shipping_address')
    .notEmpty()
    .withMessage('La dirección de envío es requerida')
    .isObject()
    .withMessage('La dirección de envío debe ser un objeto'),

  body('shipping_address.address')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('shipping_address.city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),

  body('shipping_address.state')
    .trim()
    .notEmpty()
    .withMessage('El estado/provincia es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El estado/provincia debe tener entre 2 y 100 caracteres'),

  body('shipping_address.zip')
    .trim()
    .notEmpty()
    .withMessage('El código postal es requerido')
    .isLength({ min: 3, max: 20 })
    .withMessage('El código postal debe tener entre 3 y 20 caracteres'),

  body('shipping_address.country')
    .trim()
    .notEmpty()
    .withMessage('El país es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres'),

  body('payment_method')
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isIn(Object.values(PaymentMethod))
    .withMessage('El método de pago no es válido'),
];

/**
 * Validación para actualizar estado de orden
 */
export const updateOrderStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de orden inválido'),

  body('status')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(Object.values(OrderStatus))
    .withMessage('El estado no es válido'),
];

/**
 * Validación para obtener/cancelar orden por ID
 */
export const orderIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de orden inválido'),
];

/**
 * Validación para query params de órdenes
 */
export const getOrdersQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('El estado no es válido'),

  query('userId')
    .optional()
    .isUUID()
    .withMessage('El ID de usuario debe ser un UUID válido'),
];

