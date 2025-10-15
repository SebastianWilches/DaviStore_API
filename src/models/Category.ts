/**
 * Modelo de Categoría
 * 
 * Define la estructura y tipos de datos para la entidad Category
 */

/**
 * Interface base de Categoría
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Categoría con información del padre
 */
export interface CategoryWithParent extends Category {
  parent_name?: string;
  parent_slug?: string;
}

/**
 * Categoría con subcategorías
 */
export interface CategoryWithChildren extends Category {
  children?: Category[];
}

/**
 * Datos para crear una categoría
 */
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
}

/**
 * Datos para actualizar una categoría
 */
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
}

