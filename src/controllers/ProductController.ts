/**
 * Controlador de productos
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del ProductService
 */

import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/ProductService';
import { successResponse, noContentResponse } from '../utils/response';

/**
 * Controlador de productos
 */
export class ProductController {
  /**
   * GET /products
   * Obtener productos con filtros y paginación
   */
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;
      const search = req.query.search as string | undefined;
      const isActive =
        req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const inStock = req.query.inStock === 'true';

      const result = await productService.getProducts(
        { categoryId, minPrice, maxPrice, search, isActive, inStock },
        { page, limit }
      );

      successResponse(res, result.data, 200, {
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/:id
   * Obtener producto por ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      successResponse(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /products/sku/:sku
   * Obtener producto por SKU
   */
  async getProductBySku(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await productService.getProductBySku(sku);

      successResponse(res, { product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /products
   * Crear nuevo producto
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);

      successResponse(res, { product }, 201, {
        message: 'Producto creado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /products/:id
   * Actualizar producto
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);

      successResponse(res, { product }, 200, {
        message: 'Producto actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /products/:id/stock
   * Actualizar stock de producto
   */
  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const product = await productService.updateStock(id, quantity);

      successResponse(res, { product }, 200, {
        message: 'Stock actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /products/:id
   * Eliminar producto
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();

