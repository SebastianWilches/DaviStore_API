/**
 * Servicio de gestión de carrito
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de carrito
 * - DRY: Lógica centralizada
 */

import { pool } from '../database/connection';
import {
  Cart,
  CartWithItems,
  CartItemWithProduct,
  AddToCartDto,
  UpdateCartItemDto,
  CartSummary,
} from '../models/Cart';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CartStatus } from '../types';

/**
 * Servicio de carrito
 */
export class CartService {
  /**
   * Obtener o crear carrito activo del usuario
   */
  async getOrCreateCart(userId: string): Promise<CartWithItems> {
    const client = await pool.connect();

    try {
      // Buscar carrito activo
      let cartResult = await client.query(
        'SELECT id, user_id, status, created_at, updated_at FROM carts WHERE user_id = $1 AND status = $2',
        [userId, CartStatus.ACTIVE]
      );

      let cart: Cart;

      if (cartResult.rows.length === 0) {
        // Buscar si existe un carrito completed o abandoned para reutilizarlo
        const existingCartResult = await client.query(
          'SELECT id, user_id, status, created_at, updated_at FROM carts WHERE user_id = $1',
          [userId]
        );

        if (existingCartResult.rows.length > 0) {
          // Reutilizar carrito existente: eliminar items antiguos y marcar como activo
          const existingCart = existingCartResult.rows[0];
          
          // Eliminar items antiguos
          await client.query('DELETE FROM cart_items WHERE cart_id = $1', [existingCart.id]);
          
          // Actualizar estado a activo
          const updateResult = await client.query(
            `UPDATE carts 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2
             RETURNING id, user_id, status, created_at, updated_at`,
            [CartStatus.ACTIVE, existingCart.id]
          );
          
          cart = updateResult.rows[0];
        } else {
          // Crear nuevo carrito
          const createResult = await client.query(
            `INSERT INTO carts (user_id, status) 
             VALUES ($1, $2)
             RETURNING id, user_id, status, created_at, updated_at`,
            [userId, CartStatus.ACTIVE]
          );

          cart = createResult.rows[0];
        }
      } else {
        cart = cartResult.rows[0];
      }

      // Obtener items del carrito con información del producto
      const itemsResult = await client.query(
        `SELECT 
          ci.id, ci.cart_id, ci.product_id, ci.quantity, 
          ci.price_at_addition, ci.created_at, ci.updated_at,
          p.name as product_name, p.sku as product_sku, 
          p.image_url as product_image_url, p.stock_quantity as product_stock,
          p.price as current_price
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
        ORDER BY ci.created_at DESC`,
        [cart.id]
      );

      const items: CartItemWithProduct[] = itemsResult.rows.map((row) => ({
        id: row.id,
        cart_id: row.cart_id,
        product_id: row.product_id,
        quantity: row.quantity,
        price_at_addition: parseFloat(row.price_at_addition),
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_name: row.product_name,
        product_sku: row.product_sku,
        product_image_url: row.product_image_url,
        product_stock: row.product_stock,
        current_price: parseFloat(row.current_price),
      }));

      const subtotal = items.reduce(
        (sum, item) => sum + item.price_at_addition * item.quantity,
        0
      );

      return {
        ...cart,
        items,
        total_items: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addToCart(userId: string, data: AddToCartDto): Promise<CartWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el producto existe y está activo
      const productResult = await client.query(
        'SELECT id, price, stock_quantity, is_active FROM products WHERE id = $1',
        [data.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new NotFoundError('Producto no encontrado');
      }

      const product = productResult.rows[0];

      if (!product.is_active) {
        throw new ValidationError('El producto no está disponible');
      }

      // Validar cantidad
      if (data.quantity <= 0) {
        throw new ValidationError('La cantidad debe ser mayor a 0');
      }

      if (data.quantity > product.stock_quantity) {
        throw new ValidationError(
          `Stock insuficiente. Disponible: ${product.stock_quantity}`
        );
      }

      // Obtener o crear carrito
      let cartResult = await client.query(
        'SELECT id FROM carts WHERE user_id = $1 AND status = $2',
        [userId, CartStatus.ACTIVE]
      );

      let cartId: string;

      if (cartResult.rows.length === 0) {
        const createResult = await client.query(
          'INSERT INTO carts (user_id, status) VALUES ($1, $2) RETURNING id',
          [userId, CartStatus.ACTIVE]
        );
        cartId = createResult.rows[0].id;
      } else {
        cartId = cartResult.rows[0].id;
      }

      // Verificar si el producto ya está en el carrito
      const existingItemResult = await client.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, data.product_id]
      );

      if (existingItemResult.rows.length > 0) {
        // Actualizar cantidad del item existente
        const existingItem = existingItemResult.rows[0];
        const newQuantity = existingItem.quantity + data.quantity;

        if (newQuantity > product.stock_quantity) {
          throw new ValidationError(
            `Stock insuficiente. Disponible: ${product.stock_quantity}, en carrito: ${existingItem.quantity}`
          );
        }

        await client.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newQuantity, existingItem.id]
        );
      } else {
        // Agregar nuevo item
        await client.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, price_at_addition)
           VALUES ($1, $2, $3, $4)`,
          [cartId, data.product_id, data.quantity, product.price]
        );
      }

      // Actualizar timestamp del carrito
      await client.query(
        'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [cartId]
      );

      await client.query('COMMIT');

      // Retornar carrito actualizado
      return await this.getOrCreateCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar cantidad de un item del carrito
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    data: UpdateCartItemDto
  ): Promise<CartWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el item existe y pertenece al usuario
      const itemResult = await client.query(
        `SELECT ci.id, ci.product_id, ci.quantity, p.stock_quantity, c.user_id
         FROM cart_items ci
         INNER JOIN carts c ON ci.cart_id = c.id
         INNER JOIN products p ON ci.product_id = p.id
         WHERE ci.id = $1 AND c.status = $2`,
        [itemId, CartStatus.ACTIVE]
      );

      if (itemResult.rows.length === 0) {
        throw new NotFoundError('Item del carrito no encontrado');
      }

      const item = itemResult.rows[0];

      if (item.user_id !== userId) {
        throw new ValidationError('No tienes permiso para modificar este item');
      }

      // Validar cantidad
      if (data.quantity <= 0) {
        throw new ValidationError('La cantidad debe ser mayor a 0');
      }

      if (data.quantity > item.stock_quantity) {
        throw new ValidationError(
          `Stock insuficiente. Disponible: ${item.stock_quantity}`
        );
      }

      // Actualizar cantidad
      await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [data.quantity, itemId]
      );

      await client.query('COMMIT');

      // Retornar carrito actualizado
      return await this.getOrCreateCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar item del carrito
   */
  async removeFromCart(userId: string, itemId: string): Promise<CartWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el item existe y pertenece al usuario
      const itemResult = await client.query(
        `SELECT c.user_id
         FROM cart_items ci
         INNER JOIN carts c ON ci.cart_id = c.id
         WHERE ci.id = $1 AND c.status = $2`,
        [itemId, CartStatus.ACTIVE]
      );

      if (itemResult.rows.length === 0) {
        throw new NotFoundError('Item del carrito no encontrado');
      }

      if (itemResult.rows[0].user_id !== userId) {
        throw new ValidationError('No tienes permiso para eliminar este item');
      }

      // Eliminar item
      await client.query('DELETE FROM cart_items WHERE id = $1', [itemId]);

      await client.query('COMMIT');

      // Retornar carrito actualizado
      return await this.getOrCreateCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Vaciar carrito
   */
  async clearCart(userId: string): Promise<CartWithItems> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Obtener carrito activo
      const cartResult = await client.query(
        'SELECT id FROM carts WHERE user_id = $1 AND status = $2',
        [userId, CartStatus.ACTIVE]
      );

      if (cartResult.rows.length > 0) {
        const cartId = cartResult.rows[0].id;

        // Eliminar todos los items
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

        // Actualizar timestamp
        await client.query(
          'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [cartId]
        );
      }

      await client.query('COMMIT');

      // Retornar carrito vacío
      return await this.getOrCreateCart(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener resumen del carrito
   */
  async getCartSummary(userId: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId);

    return {
      total_items: cart.total_items,
      subtotal: cart.subtotal,
      items_count: cart.items.length,
    };
  }

  /**
   * Marcar carrito como completado (después de checkout)
   */
  async completeCart(cartId: string): Promise<void> {
    await pool.query(
      'UPDATE carts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [CartStatus.COMPLETED, cartId]
    );
  }
}

export const cartService = new CartService();

