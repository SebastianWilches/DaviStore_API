/**
 * Modelo de Orden
 * 
 * Define la estructura y tipos de datos para la entidad Order y OrderItem
 */

import { OrderStatus } from '../types';

/**
 * Interface base de Orden
 */
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface de Item de la Orden
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: Date;
}

/**
 * Item de orden con información del producto (alias para compatibilidad)
 */
export interface OrderItemWithProduct extends OrderItem {}

/**
 * Orden con sus items
 */
export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
  payment?: {
    id: string;
    method: string;
    status: string;
    transaction_id: string | null;
  };
}

/**
 * Orden con información de usuario
 */
export interface OrderWithUser extends Order {
  user_email: string;
  user_first_name: string;
  user_last_name: string;
}

/**
 * Dirección de envío
 */
export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Datos para crear una orden (checkout)
 */
export interface CreateOrderDto {
  shipping_address: ShippingAddress;
  payment_method: string;
  notes?: string;
}

/**
 * Datos para actualizar estado de orden
 */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

