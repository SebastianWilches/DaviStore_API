/**
 * Rutas de usuarios
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de usuarios
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin, requireOwnerOrAdmin } from '../middlewares/authorize';
import {
  updateUserValidation,
  getUserByIdValidation,
  deleteUserValidation,
  toggleUserStatusValidation,
  getUsersQueryValidation,
} from '../validations/userValidations';

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Obtener lista de usuarios con paginación
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(getUsersQueryValidation),
  userController.getUsers.bind(userController)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  authenticate,
  requireOwnerOrAdmin('id'),
  validate(getUserByIdValidation),
  userController.getUserById.bind(userController)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  authenticate,
  requireOwnerOrAdmin('id'),
  validate(updateUserValidation),
  userController.updateUser.bind(userController)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(deleteUserValidation),
  userController.deleteUser.bind(userController)
);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activar usuario
 * @access  Private (Admin)
 */
router.patch(
  '/:id/activate',
  authenticate,
  requireAdmin,
  validate(toggleUserStatusValidation),
  userController.activateUser.bind(userController)
);

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Desactivar usuario
 * @access  Private (Admin)
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  requireAdmin,
  validate(toggleUserStatusValidation),
  userController.deactivateUser.bind(userController)
);

export default router;

