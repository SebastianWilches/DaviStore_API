/**
 * Validaciones para rutas de categorías
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida datos de entrada
 * - DRY: Validaciones reutilizables
 */

import { body, param, query } from 'express-validator';

/**
 * Validación para crear categoría
 */
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('slug')
    .trim()
    .notEmpty()
    .withMessage('El slug es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El slug debe tener entre 2 y 100 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('El slug solo puede contener letras minúsculas, números y guiones'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede tener más de 500 caracteres'),

  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('El ID de la categoría padre debe ser un UUID válido'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de imagen debe ser válida'),
];

/**
 * Validación para actualizar categoría
 */
export const updateCategoryValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de categoría inválido'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El slug debe tener entre 2 y 100 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('El slug solo puede contener letras minúsculas, números y guiones'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede tener más de 500 caracteres'),

  body('parent_id')
    .optional()
    .custom((value) => value === null || value === undefined || typeof value === 'string')
    .withMessage('El ID de la categoría padre debe ser un UUID o null'),

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
 * Validación para obtener/eliminar categoría por ID
 */
export const categoryIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de categoría inválido'),
];

/**
 * Validación para obtener categoría por slug
 */
export const categorySlugValidation = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('El slug tiene un formato inválido'),
];

/**
 * Validación para query params de categorías
 */
export const getCategoriesQueryValidation = [
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive debe ser true o false'),
];

