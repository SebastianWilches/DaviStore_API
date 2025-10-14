/**
 * Servicio de gestión de productos
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de productos
 * - DRY: Lógica centralizada
 */

import { pool } from '../database/connection';
import {
  Product,
  ProductWithCategory,
  CreateProductDto,
  UpdateProductDto,
} from '../models/Product';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  inStock?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: ProductWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Servicio de productos
 */
export class ProductService {
  /**
   * Obtener productos con filtros y paginación
   */
  async getProducts(
    filters: ProductFilters,
    pagination: PaginationParams
  ): Promise<PaginatedProducts> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    // Filtro por categoría
    if (filters.categoryId) {
      whereConditions.push(`p.category_id = $${paramIndex}`);
      queryParams.push(filters.categoryId);
      paramIndex++;
    }

    // Filtro por precio mínimo
    if (filters.minPrice !== undefined) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      queryParams.push(filters.minPrice);
      paramIndex++;
    }

    // Filtro por precio máximo
    if (filters.maxPrice !== undefined) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      queryParams.push(filters.maxPrice);
      paramIndex++;
    }

    // Filtro por búsqueda (nombre, descripción o SKU)
    if (filters.search) {
      whereConditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR 
        p.sku ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Filtro por estado activo
    if (filters.isActive !== undefined) {
      whereConditions.push(`p.is_active = $${paramIndex}`);
      queryParams.push(filters.isActive);
      paramIndex++;
    }

    // Filtro por stock disponible
    if (filters.inStock) {
      whereConditions.push('p.stock_quantity > 0');
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;

    // Query para obtener datos
    const dataQuery = `
      SELECT 
        p.id, p.sku, p.name, p.description, p.price, 
        p.stock_quantity, p.category_id, p.image_url, 
        p.is_active, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Ejecutar queries
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const products = dataResult.rows.map((row) => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock_quantity: row.stock_quantity,
      category_id: row.category_id,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name,
      category_slug: row.category_slug,
    }));

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id: string): Promise<ProductWithCategory> {
    const query = `
      SELECT 
        p.id, p.sku, p.name, p.description, p.price, 
        p.stock_quantity, p.category_id, p.image_url, 
        p.is_active, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Producto no encontrado');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock_quantity: row.stock_quantity,
      category_id: row.category_id,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name,
      category_slug: row.category_slug,
    };
  }

  /**
   * Obtener producto por SKU
   */
  async getProductBySku(sku: string): Promise<ProductWithCategory> {
    const query = `
      SELECT 
        p.id, p.sku, p.name, p.description, p.price, 
        p.stock_quantity, p.category_id, p.image_url, 
        p.is_active, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.sku = $1
    `;

    const result = await pool.query(query, [sku]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Producto no encontrado');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock_quantity: row.stock_quantity,
      category_id: row.category_id,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_name: row.category_name,
      category_slug: row.category_slug,
    };
  }

  /**
   * Crear nuevo producto
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el SKU no exista
      const skuCheck = await client.query('SELECT id FROM products WHERE sku = $1', [
        data.sku,
      ]);

      if (skuCheck.rows.length > 0) {
        throw new ConflictError('El SKU ya está en uso');
      }

      // Verificar que la categoría exista
      const categoryCheck = await client.query(
        'SELECT id FROM categories WHERE id = $1',
        [data.category_id]
      );

      if (categoryCheck.rows.length === 0) {
        throw new ValidationError('La categoría no existe');
      }

      // Validar precio y stock
      if (data.price < 0) {
        throw new ValidationError('El precio no puede ser negativo');
      }

      if (data.stock_quantity < 0) {
        throw new ValidationError('El stock no puede ser negativo');
      }

      // Crear producto
      const insertQuery = `
        INSERT INTO products (
          sku, name, description, price, stock_quantity, 
          category_id, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, sku, name, description, price, stock_quantity, 
                  category_id, image_url, is_active, created_at, updated_at
      `;

      const values = [
        data.sku,
        data.name,
        data.description,
        data.price,
        data.stock_quantity,
        data.category_id,
        data.image_url || null,
      ];

      const result = await client.query(insertQuery, values);

      await client.query('COMMIT');

      const product = result.rows[0];
      return {
        ...product,
        price: parseFloat(product.price),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el producto existe
      const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [
        id,
      ]);

      if (productCheck.rows.length === 0) {
        throw new NotFoundError('Producto no encontrado');
      }

      // Si se actualiza la categoría, verificar que exista
      if (data.category_id) {
        const categoryCheck = await client.query(
          'SELECT id FROM categories WHERE id = $1',
          [data.category_id]
        );

        if (categoryCheck.rows.length === 0) {
          throw new ValidationError('La categoría no existe');
        }
      }

      // Validar precio y stock si se proporcionan
      if (data.price !== undefined && data.price < 0) {
        throw new ValidationError('El precio no puede ser negativo');
      }

      if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
        throw new ValidationError('El stock no puede ser negativo');
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

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(data.description);
        paramIndex++;
      }

      if (data.price !== undefined) {
        updates.push(`price = $${paramIndex}`);
        values.push(data.price);
        paramIndex++;
      }

      if (data.stock_quantity !== undefined) {
        updates.push(`stock_quantity = $${paramIndex}`);
        values.push(data.stock_quantity);
        paramIndex++;
      }

      if (data.category_id) {
        updates.push(`category_id = $${paramIndex}`);
        values.push(data.category_id);
        paramIndex++;
      }

      if (data.image_url !== undefined) {
        updates.push(`image_url = $${paramIndex}`);
        values.push(data.image_url);
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
        UPDATE products
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, sku, name, description, price, stock_quantity, 
                  category_id, image_url, is_active, created_at, updated_at
      `;

      values.push(id);

      const result = await client.query(updateQuery, values);

      await client.query('COMMIT');

      const product = result.rows[0];
      return {
        ...product,
        price: parseFloat(product.price),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id: string): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que no esté en carritos activos
      const cartCheck = await client.query(
        `SELECT ci.id FROM cart_items ci
         INNER JOIN carts c ON ci.cart_id = c.id
         WHERE ci.product_id = $1 AND c.status = 'active'
         LIMIT 1`,
        [id]
      );

      if (cartCheck.rows.length > 0) {
        throw new ValidationError(
          'No se puede eliminar un producto que está en carritos activos'
        );
      }

      // Verificar que no esté en órdenes
      const orderCheck = await client.query(
        'SELECT id FROM order_items WHERE product_id = $1 LIMIT 1',
        [id]
      );

      if (orderCheck.rows.length > 0) {
        throw new ValidationError(
          'No se puede eliminar un producto que está en órdenes'
        );
      }

      // Eliminar producto
      const result = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Producto no encontrado');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar stock de producto
   */
  async updateStock(id: string, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new ValidationError('La cantidad no puede ser negativa');
    }

    const result = await pool.query(
      `UPDATE products 
       SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, sku, name, description, price, stock_quantity, 
                 category_id, image_url, is_active, created_at, updated_at`,
      [quantity, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Producto no encontrado');
    }

    const product = result.rows[0];
    return {
      ...product,
      price: parseFloat(product.price),
    };
  }
}

export const productService = new ProductService();

