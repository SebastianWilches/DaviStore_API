/**
 * Modelo de Usuario
 * 
 * Define la estructura y tipos de datos para la entidad User
 */

import { UserRole } from '../types';

/**
 * Interface base de Usuario (campos de BD)
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Usuario sin información sensible (para responses)
 */
export interface UserSafe {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Datos para crear un usuario
 */
export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  password?: string;
}

/**
 * Datos de login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Datos de respuesta de autenticación
 */
export interface AuthResponse {
  user: UserSafe;
  accessToken: string;
  refreshToken: string;
}

