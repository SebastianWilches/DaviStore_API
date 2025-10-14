/**
 * Servicio de gestión de usuarios
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de usuarios
 * - Dependency Inversion: Depende de abstracciones
 * - DRY: Lógica centralizada
 */

import { pool } from '../database/connection';
import { User, UpdateUserDto, UserWithRole } from '../models/User';
import { hashPassword, getPasswordStrengthError } from '../utils/password';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Servicio de usuarios
 */
export class UserService {
  /**
   * Obtener lista de usuarios con paginación
   */
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<Omit<UserWithRole, 'password_hash'>>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // Construir query dinámicamente
    let whereConditions: string[] = [];
    let queryParams: unknown[] = [];
    let paramIndex = 1;

    // Filtro por búsqueda (email, nombre o apellido)
    if (params.search) {
      whereConditions.push(`(
        u.email ILIKE $${paramIndex} OR 
        u.first_name ILIKE $${paramIndex} OR 
        u.last_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    // Filtro por estado activo
    if (params.isActive !== undefined) {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      queryParams.push(params.isActive);
      paramIndex++;
    }

    // Filtro por rol
    if (params.roleId) {
      whereConditions.push(`u.role_id = $${paramIndex}`);
      queryParams.push(params.roleId);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;

    // Query para obtener datos
    const dataQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, 
        u.phone, u.role_id, u.is_active, u.created_at, u.updated_at,
        r.id as role_id, r.name as role_name, r.display_name as role_display_name,
        r.description as role_description, r.is_active as role_is_active,
        r.created_at as role_created_at, r.updated_at as role_updated_at
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Ejecutar queries
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const users = dataResult.rows.map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      role_id: row.role_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: {
        id: row.role_id,
        name: row.role_name,
        display_name: row.role_display_name,
        description: row.role_description,
        is_active: row.role_is_active,
        created_at: row.role_created_at,
        updated_at: row.role_updated_at,
      },
    }));

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<Omit<UserWithRole, 'password_hash'>> {
    const query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, 
        u.phone, u.role_id, u.is_active, u.created_at, u.updated_at,
        r.id as role_id, r.name as role_name, r.display_name as role_display_name,
        r.description as role_description, r.is_active as role_is_active,
        r.created_at as role_created_at, r.updated_at as role_updated_at
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      role_id: row.role_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: {
        id: row.role_id,
        name: row.role_name,
        display_name: row.role_display_name,
        description: row.role_description,
        is_active: row.role_is_active,
        created_at: row.role_created_at,
        updated_at: row.role_updated_at,
      },
    };
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<Omit<UserWithRole, 'password_hash'>> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que el usuario existe
      const userCheck = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Si se actualiza el email, verificar que no exista
      if (data.email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [data.email.toLowerCase(), id]
        );

        if (emailCheck.rows.length > 0) {
          throw new ConflictError('El email ya está en uso');
        }
      }

      // Si se actualiza la contraseña, validar y hashear
      let passwordHash: string | undefined;
      if (data.password) {
        const passwordError = getPasswordStrengthError(data.password);
        if (passwordError) {
          throw new ValidationError(passwordError);
        }
        passwordHash = await hashPassword(data.password);
      }

      // Construir query de actualización
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (data.email) {
        updates.push(`email = $${paramIndex}`);
        values.push(data.email.toLowerCase());
        paramIndex++;
      }

      if (passwordHash) {
        updates.push(`password_hash = $${paramIndex}`);
        values.push(passwordHash);
        paramIndex++;
      }

      if (data.first_name) {
        updates.push(`first_name = $${paramIndex}`);
        values.push(data.first_name);
        paramIndex++;
      }

      if (data.last_name) {
        updates.push(`last_name = $${paramIndex}`);
        values.push(data.last_name);
        paramIndex++;
      }

      if (data.phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        values.push(data.phone);
        paramIndex++;
      }

      if (data.role_id) {
        updates.push(`role_id = $${paramIndex}`);
        values.push(data.role_id);
        paramIndex++;
      }

      if (updates.length === 0) {
        throw new ValidationError('No hay campos para actualizar');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      const updateQuery = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, phone, role_id, is_active, created_at, updated_at
      `;

      values.push(id);

      const result = await client.query(updateQuery, values);
      const updatedUser = result.rows[0] as User;

      // Obtener información del rol
      const roleQuery = `
        SELECT id, name, display_name, description, is_active, created_at, updated_at
        FROM roles
        WHERE id = $1
      `;
      const roleResult = await client.query(roleQuery, [updatedUser.role_id]);

      await client.query('COMMIT');

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        role_id: updatedUser.role_id,
        is_active: updatedUser.is_active,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        role: roleResult.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Usuario no encontrado');
    }
  }

  /**
   * Activar usuario
   */
  async activateUser(id: string): Promise<Omit<UserWithRole, 'password_hash'>> {
    const result = await pool.query(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.getUserById(id);
  }

  /**
   * Desactivar usuario
   */
  async deactivateUser(id: string): Promise<Omit<UserWithRole, 'password_hash'>> {
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.getUserById(id);
  }
}

export const userService = new UserService();

