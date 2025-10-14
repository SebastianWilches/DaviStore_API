/**
 * Servicio de gestión de categorías
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de categorías
 * - DRY: Lógica centralizada
 */

import { pool } from '../database/connection';
import {
  Category,
  CategoryWithParent,
  CategoryWithChildren,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../models/Category';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

/**
 * Servicio de categorías
 */
export class CategoryService {
  /**
   * Obtener todas las categorías
   */
  async getCategories(includeInactive = false): Promise<CategoryWithParent[]> {
    const whereClause = includeInactive ? '' : 'WHERE c.is_active = true';

    const query = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, 
        c.is_active, c.created_at, c.updated_at,
        p.name as parent_name, p.slug as parent_slug
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ${whereClause}
      ORDER BY c.name ASC
    `;

    const result = await pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_name: row.parent_name,
      parent_slug: row.parent_slug,
    }));
  }

  /**
   * Obtener categorías raíz (sin padre) con sus hijos
   */
  async getCategoriesTree(): Promise<CategoryWithChildren[]> {
    // Obtener categorías raíz
    const rootQuery = `
      SELECT id, name, slug, description, parent_id, 
             is_active, created_at, updated_at
      FROM categories
      WHERE parent_id IS NULL AND is_active = true
      ORDER BY name ASC
    `;

    const rootResult = await pool.query(rootQuery);

    // Para cada categoría raíz, obtener sus hijos
    const categoriesWithChildren = await Promise.all(
      rootResult.rows.map(async (root) => {
        const childrenQuery = `
          SELECT id, name, slug, description, parent_id, 
                 is_active, created_at, updated_at
          FROM categories
          WHERE parent_id = $1 AND is_active = true
          ORDER BY name ASC
        `;

        const childrenResult = await pool.query(childrenQuery, [root.id]);

        return {
          ...root,
          children: childrenResult.rows,
        };
      })
    );

    return categoriesWithChildren;
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(id: string): Promise<CategoryWithParent> {
    const query = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, 
        c.is_active, c.created_at, c.updated_at,
        p.name as parent_name, p.slug as parent_slug
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_name: row.parent_name,
      parent_slug: row.parent_slug,
    };
  }

  /**
   * Obtener categoría por slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithParent> {
    const query = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.parent_id, 
        c.is_active, c.created_at, c.updated_at,
        p.name as parent_name, p.slug as parent_slug
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.slug = $1
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      parent_name: row.parent_name,
      parent_slug: row.parent_slug,
    };
  }

  /**
   * Crear nueva categoría
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el slug no exista
      const slugCheck = await client.query(
        'SELECT id FROM categories WHERE slug = $1',
        [data.slug]
      );

      if (slugCheck.rows.length > 0) {
        throw new ConflictError('El slug ya está en uso');
      }

      // Si tiene parent_id, verificar que exista
      if (data.parent_id) {
        const parentCheck = await client.query(
          'SELECT id FROM categories WHERE id = $1',
          [data.parent_id]
        );

        if (parentCheck.rows.length === 0) {
          throw new ValidationError('La categoría padre no existe');
        }
      }

      // Crear categoría
      const insertQuery = `
        INSERT INTO categories (name, slug, description, parent_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, slug, description, parent_id, 
                  is_active, created_at, updated_at
      `;

      const values = [
        data.name,
        data.slug,
        data.description || null,
        data.parent_id || null,
      ];

      const result = await client.query(insertQuery, values);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que la categoría existe
      const categoryCheck = await client.query(
        'SELECT id FROM categories WHERE id = $1',
        [id]
      );

      if (categoryCheck.rows.length === 0) {
        throw new NotFoundError('Categoría no encontrada');
      }

      // Si se actualiza el slug, verificar que no exista
      if (data.slug) {
        const slugCheck = await client.query(
          'SELECT id FROM categories WHERE slug = $1 AND id != $2',
          [data.slug, id]
        );

        if (slugCheck.rows.length > 0) {
          throw new ConflictError('El slug ya está en uso');
        }
      }

      // Si se actualiza parent_id, verificar que no sea circular
      if (data.parent_id) {
        if (data.parent_id === id) {
          throw new ValidationError('Una categoría no puede ser su propia padre');
        }

        const parentCheck = await client.query(
          'SELECT id FROM categories WHERE id = $1',
          [data.parent_id]
        );

        if (parentCheck.rows.length === 0) {
          throw new ValidationError('La categoría padre no existe');
        }
      }

      // Construir query de actualización
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (data.name) {
        updates.push(`name = $${paramIndex}`);
        values.push(data.name);
        paramIndex++;
      }

      if (data.slug) {
        updates.push(`slug = $${paramIndex}`);
        values.push(data.slug);
        paramIndex++;
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(data.description);
        paramIndex++;
      }

      if (data.parent_id !== undefined) {
        updates.push(`parent_id = $${paramIndex}`);
        values.push(data.parent_id);
        paramIndex++;
      }

      if (data.is_active !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        values.push(data.is_active);
        paramIndex++;
      }

      if (updates.length === 0) {
        throw new ValidationError('No hay campos para actualizar');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      const updateQuery = `
        UPDATE categories
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, slug, description, parent_id, 
                  is_active, created_at, updated_at
      `;

      values.push(id);

      const result = await client.query(updateQuery, values);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: string): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que no tenga productos
      const productsCheck = await client.query(
        'SELECT id FROM products WHERE category_id = $1 LIMIT 1',
        [id]
      );

      if (productsCheck.rows.length > 0) {
        throw new ValidationError(
          'No se puede eliminar una categoría con productos asociados'
        );
      }

      // Verificar que no tenga subcategorías
      const childrenCheck = await client.query(
        'SELECT id FROM categories WHERE parent_id = $1 LIMIT 1',
        [id]
      );

      if (childrenCheck.rows.length > 0) {
        throw new ValidationError(
          'No se puede eliminar una categoría con subcategorías'
        );
      }

      // Eliminar categoría
      const result = await client.query(
        'DELETE FROM categories WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Categoría no encontrada');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const categoryService = new CategoryService();

