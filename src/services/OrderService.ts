/**
 * Servicio de gestión de órdenes
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de órdenes
 * - DRY: Lógica centralizada
 */

import { pool } from '../database/connection';
import {
  OrderWithItems,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from '../models/Order';
import { NotFoundError, ValidationError } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '../types';
import { cartService } from './CartService';

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
}

export interface PaginatedOrders {
  data: OrderWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Servicio de órdenes
 */
export class OrderService {
  /**
   * Crear orden desde el carrito (checkout)
   */
  async createOrder(userId: string, data: CreateOrderDto): Promise<OrderWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Obtener carrito activo con items
      const cart = await cartService.getOrCreateCart(userId);

      if (cart.items.length === 0) {
        throw new ValidationError('El carrito está vacío');
      }

      // Validar stock de todos los productos
      for (const item of cart.items) {
        if (item.quantity > item.product_stock) {
          throw new ValidationError(
            `Stock insuficiente para ${item.product_name}. Disponible: ${item.product_stock}`
          );
        }
      }

      // Calcular totales
      const subtotal = cart.subtotal;
      const tax = subtotal * 0.16; // 16% de IVA (configurable)
      const shipping_cost = subtotal >= 500 ? 0 : 50; // Envío gratis sobre $500
      const total = subtotal + tax + shipping_cost;

      // Crear orden
      const orderQuery = `
        INSERT INTO orders (
          user_id, status, subtotal, tax, shipping_cost, total,
          shipping_address, shipping_city, shipping_state, 
          shipping_zip, shipping_country, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, user_id, status, subtotal, tax, shipping_cost, total,
                  shipping_address, shipping_city, shipping_state, shipping_zip,
                  shipping_country, notes, created_at, updated_at
      `;

      const orderValues = [
        userId,
        OrderStatus.PENDING,
        subtotal,
        tax,
        shipping_cost,
        total,
        data.shipping_address.address,
        data.shipping_address.city,
        data.shipping_address.state,
        data.shipping_address.zip,
        data.shipping_address.country,
        data.notes || null,
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Crear items de la orden y reducir stock
      for (const item of cart.items) {
        // Insertar order_item
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.current_price, item.current_price * item.quantity]
        );

        // Reducir stock del producto
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Crear pago pendiente
      await client.query(
        `INSERT INTO payments (order_id, method, status, amount)
         VALUES ($1, $2, $3, $4)`,
        [order.id, data.payment_method, PaymentStatus.PENDING, total]
      );

      // Marcar carrito como completado
      await cartService.completeCart(cart.id);

      await client.query('COMMIT');

      // Retornar orden con items
      return await this.getOrderById(order.id, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener orden por ID
   */
  async getOrderById(orderId: string, userId?: string): Promise<OrderWithItems> {
    let query = `
      SELECT 
        o.id, o.user_id, o.status, o.subtotal, o.tax, o.shipping_cost, o.total,
        o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip,
        o.shipping_country, o.notes, o.created_at, o.updated_at
      FROM orders o
      WHERE o.id = $1
    `;

    const params: unknown[] = [orderId];

    // Si se proporciona userId, verificar que la orden pertenezca al usuario
    if (userId) {
      query += ' AND o.user_id = $2';
      params.push(userId);
    }

    const orderResult = await pool.query(query, params);

    if (orderResult.rows.length === 0) {
      throw new NotFoundError('Orden no encontrada');
    }

    const order = orderResult.rows[0];

    // Obtener items de la orden
    const itemsResult = await pool.query(
      `SELECT 
        oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, 
        oi.subtotal, oi.created_at,
        p.name as product_name, p.sku as product_sku, p.image_url as product_image_url
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at DESC`,
      [orderId]
    );

    // Obtener información del pago
    const paymentResult = await pool.query(
      'SELECT id, method, status, transaction_id FROM payments WHERE order_id = $1',
      [orderId]
    );

    const payment = paymentResult.rows.length > 0
      ? {
          id: paymentResult.rows[0].id,
          method: paymentResult.rows[0].method,
          status: paymentResult.rows[0].status,
          transaction_id: paymentResult.rows[0].transaction_id,
        }
      : undefined;

    return {
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping_cost: parseFloat(order.shipping_cost),
      total: parseFloat(order.total),
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_zip: order.shipping_zip,
      shipping_country: order.shipping_country,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: itemsResult.rows.map((row) => ({
        id: row.id,
        order_id: row.order_id,
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: parseFloat(row.unit_price),
        subtotal: parseFloat(row.subtotal),
        created_at: row.created_at,
        product_name: row.product_name,
        product_sku: row.product_sku,
        product_image_url: row.product_image_url,
      })),
      payment,
    };
  }

  /**
   * Obtener órdenes con paginación
   */
  async getOrders(params: PaginationParams): Promise<PaginatedOrders> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    // Filtro por estado
    if (params.status) {
      whereConditions.push(`o.status = $${paramIndex}`);
      queryParams.push(params.status);
      paramIndex++;
    }

    // Filtro por usuario
    if (params.userId) {
      whereConditions.push(`o.user_id = $${paramIndex}`);
      queryParams.push(params.userId);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;

    // Query para obtener datos
    const dataQuery = `
      SELECT 
        o.id, o.user_id, o.status, o.subtotal, o.tax, o.shipping_cost, o.total,
        o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_zip,
        o.shipping_country, o.notes, o.created_at, o.updated_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Ejecutar queries
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Obtener items y pagos para cada orden
    const orders = await Promise.all(
      dataResult.rows.map(async (order) => {
        return await this.getOrderById(order.id);
      })
    );

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Actualizar estado de orden (solo admin)
   */
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusDto
  ): Promise<OrderWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que la orden existe
      const orderCheck = await client.query(
        'SELECT id, status FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderCheck.rows.length === 0) {
        throw new NotFoundError('Orden no encontrada');
      }

      const currentStatus = orderCheck.rows[0].status;

      // Validar transiciones de estado
      if (currentStatus === OrderStatus.CANCELLED) {
        throw new ValidationError('No se puede modificar una orden cancelada');
      }

      if (currentStatus === OrderStatus.COMPLETED) {
        throw new ValidationError('No se puede modificar una orden completada');
      }

      // Actualizar orden
      const updateQuery = `
        UPDATE orders
        SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `;

      await client.query(updateQuery, [data.status, data.notes || null, orderId]);

      // Si se aprueba, actualizar estado del pago
      if (data.status === OrderStatus.COMPLETED) {
        await client.query(
          'UPDATE payments SET status = $1, payment_date = CURRENT_TIMESTAMP WHERE order_id = $2',
          [PaymentStatus.APPROVED, orderId]
        );
      }

      // Si se cancela, restaurar stock
      if (data.status === OrderStatus.CANCELLED) {
        const itemsResult = await client.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [orderId]
        );

        for (const item of itemsResult.rows) {
          await client.query(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        // Actualizar estado del pago
        await client.query(
          'UPDATE payments SET status = $1 WHERE order_id = $2',
          [PaymentStatus.REFUNDED, orderId]
        );
      }

      await client.query('COMMIT');

      return await this.getOrderById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancelar orden (solo si está pending)
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que la orden existe y pertenece al usuario
      const orderResult = await client.query(
        'SELECT id, user_id, status FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new NotFoundError('Orden no encontrada');
      }

      const order = orderResult.rows[0];

      if (order.user_id !== userId) {
        throw new ValidationError('No tienes permiso para cancelar esta orden');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new ValidationError('Solo se pueden cancelar órdenes pendientes');
      }

      // Restaurar stock
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Actualizar orden
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [OrderStatus.CANCELLED, orderId]
      );

      // Actualizar pago
      await client.query(
        'UPDATE payments SET status = $1 WHERE order_id = $2',
        [PaymentStatus.REFUNDED, orderId]
      );

      await client.query('COMMIT');

      return await this.getOrderById(orderId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const orderService = new OrderService();

