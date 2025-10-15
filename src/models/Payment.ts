/**
 * Modelo de Pago
 * 
 * Define la estructura y tipos de datos para la entidad Payment
 */

import { PaymentMethod, PaymentStatus } from '../types';

/**
 * Interface base de Pago
 */
export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transaction_id: string | null;
  payment_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Datos para crear un pago
 */
export interface CreatePaymentDto {
  order_id: string;
  method: PaymentMethod;
  amount: number;
  transaction_id?: string;
}

/**
 * Datos para actualizar estado de pago
 */
export interface UpdatePaymentStatusDto {
  status: PaymentStatus;
  transaction_id?: string;
}

