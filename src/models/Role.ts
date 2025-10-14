/**
 * Modelo de Rol
 * 
 * Define la estructura y tipos de datos para la entidad Role
 */

/**
 * Interface base de Rol
 */
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Datos para crear un rol
 */
export interface CreateRoleDto {
  name: string;
  display_name: string;
  description?: string;
}

/**
 * Datos para actualizar un rol
 */
export interface UpdateRoleDto {
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Nombres de roles predefinidos (para type safety)
 */
export enum RoleName {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

