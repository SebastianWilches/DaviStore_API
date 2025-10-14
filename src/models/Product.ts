/**
 * Modelo de Producto
 * 
 * Define la estructura y tipos de datos para la entidad Product
 */

/**
 * Interface base de Producto
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Producto con información de categoría
 */
export interface ProductWithCategory extends Product {
  category_name: string;
  category_slug: string;
}

/**
 * Datos para crear un producto
 */
export interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  image_url?: string;
}

/**
 * Datos para actualizar un producto
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  category_id?: string;
  image_url?: string;
  is_active?: boolean;
}

