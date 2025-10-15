/**
 * Validaciones para rutas de productos
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida datos de entrada
 * - DRY: Validaciones reutilizables
 */

import { body, param, query } from 'express-validator';

/**
 * Validación para crear producto
 */
export const createProductValidation = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('El SKU es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El SKU debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),

  body('stock_quantity')
    .notEmpty()
    .withMessage('La cantidad en stock es requerida')
    .isInt({ min: 0 })
    .withMessage('La cantidad en stock debe ser un número entero mayor o igual a 0'),

  body('category_id')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isUUID()
    .withMessage('El ID de categoría debe ser un UUID válido'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de imagen debe ser válida'),
];

/**
 * Validación para actualizar producto
 */
export const updateProductValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de producto inválido'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('El nombre debe tener entre 2 y 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),

  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad en stock debe ser un número entero mayor o igual a 0'),

  body('category_id')
    .optional()
    .isUUID()
    .withMessage('El ID de categoría debe ser un UUID válido'),

  body('image_url')
    .optional()
    .custom((value) => value === null || value === undefined || typeof value === 'string')
    .withMessage('La URL de imagen debe ser una cadena o null'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un booleano'),
];

/**
 * Validación para actualizar stock
 */
export const updateStockValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de producto inválido'),

  body('quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 0'),
];

/**
 * Validación para obtener/eliminar producto por ID
 */
export const productIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de producto inválido'),
];

/**
 * Validación para obtener producto por SKU
 */
export const productSkuValidation = [
  param('sku')
    .trim()
    .notEmpty()
    .withMessage('El SKU es requerido')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El SKU tiene un formato inválido'),
];

/**
 * Validación para query params de productos
 */
export const getProductsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('El ID de categoría debe ser un UUID válido'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número mayor o igual a 0'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número mayor o igual a 0'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede tener más de 100 caracteres'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser true o false'),

  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock debe ser true o false'),
];

