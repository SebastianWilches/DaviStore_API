/**
 * Rutas de productos
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo define rutas de productos
 * - Clean Code: Rutas claras y RESTful
 */

import { Router } from 'express';
import { productController } from '../controllers/ProductController';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  createProductValidation,
  updateProductValidation,
  updateStockValidation,
  productIdValidation,
  productSkuValidation,
  getProductsQueryValidation,
} from '../validations/productValidations';

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Obtener productos con filtros y paginación
 * @access  Public
 */
router.get(
  '/',
  validate(getProductsQueryValidation),
  productController.getProducts.bind(productController)
);

/**
 * @route   GET /api/v1/products/sku/:sku
 * @desc    Obtener producto por SKU
 * @access  Public
 */
router.get(
  '/sku/:sku',
  validate(productSkuValidation),
  productController.getProductBySku.bind(productController)
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(productIdValidation),
  productController.getProductById.bind(productController)
);

/**
 * @route   POST /api/v1/products
 * @desc    Crear nuevo producto
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductValidation),
  productController.createProduct.bind(productController)
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Actualizar producto
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProductValidation),
  productController.updateProduct.bind(productController)
);

/**
 * @route   PATCH /api/v1/products/:id/stock
 * @desc    Actualizar stock de producto
 * @access  Private (Admin)
 */
router.patch(
  '/:id/stock',
  authenticate,
  requireAdmin,
  validate(updateStockValidation),
  productController.updateStock.bind(productController)
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Eliminar producto
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(productIdValidation),
  productController.deleteProduct.bind(productController)
);

export default router;

