/**
 * Modelo de Carrito
 * 
 * Define la estructura y tipos de datos para la entidad Cart y CartItem
 */

import { CartStatus } from '../types';

/**
 * Interface base de Carrito
 */
export interface Cart {
  id: string;
  user_id: string;
  status: CartStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface de Item del Carrito
 */
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_addition: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Item del carrito con información del producto
 */
export interface CartItemWithProduct extends CartItem {
  product_name: string;
  product_sku: string;
  product_image_url: string | null;
  product_stock: number;
  current_price: number;
}

/**
 * Carrito con sus items
 */
export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  total_items: number;
  subtotal: number;
}

/**
 * Datos para agregar item al carrito
 */
export interface AddToCartDto {
  product_id: string;
  quantity: number;
}

/**
 * Datos para actualizar cantidad de item
 */
export interface UpdateCartItemDto {
  quantity: number;
}

/**
 * Resumen del carrito
 */
export interface CartSummary {
  total_items: number;
  subtotal: number;
  items_count: number;
}

