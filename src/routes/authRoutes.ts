/**
 * Rutas de autenticación
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de autenticación
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
} from '../validations/authValidations';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  validate(registerValidation),
  authController.register.bind(authController)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
  '/login',
  validate(loginValidation),
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refrescar access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenValidation),
  authController.refreshToken.bind(authController)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

export default router;

