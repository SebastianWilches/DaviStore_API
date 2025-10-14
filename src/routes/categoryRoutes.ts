/**
 * Rutas de categorías
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de categorías
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  createCategoryValidation,
  updateCategoryValidation,
  categoryIdValidation,
  categorySlugValidation,
  getCategoriesQueryValidation,
} from '../validations/categoryValidations';

const router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get(
  '/',
  validate(getCategoriesQueryValidation),
  categoryController.getCategories.bind(categoryController)
);

/**
 * @route   GET /api/v1/categories/tree
 * @desc    Obtener categorías organizadas en árbol
 * @access  Public
 */
router.get(
  '/tree',
  categoryController.getCategoriesTree.bind(categoryController)
);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Obtener categoría por slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validate(categorySlugValidation),
  categoryController.getCategoryBySlug.bind(categoryController)
);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(categoryIdValidation),
  categoryController.getCategoryById.bind(categoryController)
);

/**
 * @route   POST /api/v1/categories
 * @desc    Crear nueva categoría
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCategoryValidation),
  categoryController.createCategory.bind(categoryController)
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Actualizar categoría
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateCategoryValidation),
  categoryController.updateCategory.bind(categoryController)
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Eliminar categoría
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(categoryIdValidation),
  categoryController.deleteCategory.bind(categoryController)
);

export default router;

