/**
 * Validaciones para rutas de carrito
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida datos de entrada
 * - DRY: Validaciones reutilizables
 */

import { body, param } from 'express-validator';

/**
 * Validación para agregar producto al carrito
 */
export const addToCartValidation = [
  body('product_id')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isUUID()
    .withMessage('El ID del producto debe ser un UUID válido'),

  body('quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1, max: 100 })
    .withMessage('La cantidad debe ser un número entero entre 1 y 100'),
];

/**
 * Validación para actualizar cantidad de item
 */
export const updateCartItemValidation = [
  param('itemId')
    .isUUID()
    .withMessage('ID de item inválido'),

  body('quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1, max: 100 })
    .withMessage('La cantidad debe ser un número entero entre 1 y 100'),
];

/**
 * Validación para eliminar item del carrito
 */
export const removeFromCartValidation = [
  param('itemId')
    .isUUID()
    .withMessage('ID de item inválido'),
];

