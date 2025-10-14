/**
 * Controlador de categorías
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja HTTP requests/responses
 * - Dependency Inversion: Depende del CategoryService
 */

import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/CategoryService';
import { successResponse, noContentResponse } from '../utils/response';

/**
 * Controlador de categorías
 */
export class CategoryController {
  /**
   * GET /categories
   * Obtener todas las categorías
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoryService.getCategories(includeInactive);

      successResponse(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /categories/tree
   * Obtener categorías organizadas en árbol
   */
  async getCategoriesTree(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategoriesTree();

      successResponse(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /categories/:id
   * Obtener categoría por ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);

      successResponse(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /categories/slug/:slug
   * Obtener categoría por slug
   */
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await categoryService.getCategoryBySlug(slug);

      successResponse(res, { category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /categories
   * Crear nueva categoría
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);

      successResponse(res, { category }, 201, {
        message: 'Categoría creada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /categories/:id
   * Actualizar categoría
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);

      successResponse(res, { category }, 200, {
        message: 'Categoría actualizada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /categories/:id
   * Eliminar categoría
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);

      noContentResponse(res);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();

