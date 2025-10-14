/**
 * Tipos y enums centralizados de la aplicación
 * 
 * Principios aplicados:
 * - DRY: Tipos reutilizables en toda la aplicación
 * - Type Safety: Evitar any y usar tipos específicos
 */

/**
 * Nombres de roles (para type safety en queries)
 * Nota: Los roles están en tabla 'roles', no en ENUM
 */
export enum RoleName {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * Estados del carrito
 */
export enum CartStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

/**
 * Estados de orden
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Métodos de pago
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  TRANSFER = 'transfer',
}

/**
 * Estados de pago
 */
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

/**
 * Respuesta estándar de API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    message?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Filtros de búsqueda de productos
 */
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Opciones de ordenamiento
 */
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

