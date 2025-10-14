/**
 * Validaciones para rutas de usuarios
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo valida datos de entrada
 * - DRY: Validaciones reutilizables
 */

import { body, param, query } from 'express-validator';

/**
 * Validación para actualización de usuario
 */
export const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número'),

  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono debe contener solo números y los caracteres +, -, (, ), espacio')
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede tener más de 20 caracteres'),

  body('role_id')
    .optional()
    .isUUID()
    .withMessage('ID de rol inválido'),
];

/**
 * Validación para obtener usuario por ID
 */
export const getUserByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
];

/**
 * Validación para eliminar usuario
 */
export const deleteUserValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
];

/**
 * Validación para activar/desactivar usuario
 */
export const toggleUserStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),
];

/**
 * Validación para query params de listado de usuarios
 */
export const getUsersQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede tener más de 100 caracteres'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser true o false'),

  query('roleId')
    .optional()
    .isUUID()
    .withMessage('ID de rol inválido'),
];

