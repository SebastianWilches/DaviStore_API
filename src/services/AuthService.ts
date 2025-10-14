/**
 * Servicio de autenticación
 * 
 * Principios aplicados:
 * - Single Responsibility: Maneja lógica de autenticación
 * - Dependency Inversion: Depende de abstracciones (pool)
 * - DRY: Lógica de autenticación centralizada
 */

import { pool } from '../database/connection';
import { User, CreateUserDto, UserWithRole } from '../models/User';
import { hashPassword, comparePassword, getPasswordStrengthError } from '../utils/password';
import { generateTokenPair, TokenPair, verifyRefreshToken } from '../utils/jwt';
import { 
  ConflictError, 
  UnauthorizedError, 
  NotFoundError, 
  ValidationError 
} from '../utils/errors';
import { RoleName } from '../types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends CreateUserDto {
  password: string;
}

export interface AuthResponse {
  user: Omit<UserWithRole, 'password_hash'>;
  tokens: TokenPair;
}

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const client = await pool.connect();

    try {
      // Validar fortaleza de contraseña
      const passwordError = getPasswordStrengthError(data.password);
      if (passwordError) {
        throw new ValidationError(passwordError);
      }

      // Verificar si el email ya existe
      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );

      if (emailCheck.rows.length > 0) {
        throw new ConflictError('El email ya está registrado');
      }

      // Obtener el rol de customer por defecto si no se especifica
      let roleId = data.role_id;
      if (!roleId) {
        const roleResult = await client.query(
          'SELECT id FROM roles WHERE name = $1',
          [RoleName.CUSTOMER]
        );

        if (roleResult.rows.length === 0) {
          throw new Error('Rol customer no encontrado en la base de datos');
        }

        roleId = roleResult.rows[0].id;
      }

      // Hashear contraseña
      const passwordHash = await hashPassword(data.password);

      // Crear usuario
      const insertQuery = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, phone, role_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone, role_id, is_active, created_at, updated_at
      `;

      const values = [
        data.email.toLowerCase(),
        passwordHash,
        data.first_name,
        data.last_name,
        data.phone || null,
        roleId,
      ];

      const result = await client.query(insertQuery, values);
      const user = result.rows[0] as User;

      // Obtener información del rol
      const roleQuery = `
        SELECT id, name, display_name, description, is_active, created_at, updated_at
        FROM roles
        WHERE id = $1
      `;
      const roleResult = await client.query(roleQuery, [user.role_id]);
      const role = roleResult.rows[0];

      // Generar tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        roleId: user.role_id,
      });

      // Construir respuesta
      const userWithRole: Omit<UserWithRole, 'password_hash'> = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role_id: user.role_id,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role,
      };

      return { user: userWithRole, tokens };
    } finally {
      client.release();
    }
  }

  /**
   * Iniciar sesión
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Buscar usuario por email con información del rol
    const query = `
      SELECT 
        u.id, u.email, u.password_hash, u.first_name, u.last_name, 
        u.phone, u.role_id, u.is_active, u.created_at, u.updated_at,
        r.id as role_id, r.name as role_name, r.display_name as role_display_name,
        r.description as role_description, r.is_active as role_is_active,
        r.created_at as role_created_at, r.updated_at as role_updated_at
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;

    const result = await pool.query(query, [data.email.toLowerCase()]);

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    const row = result.rows[0];

    // Verificar que el usuario esté activo
    if (!row.is_active) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // Verificar que el rol esté activo
    if (!row.role_is_active) {
      throw new UnauthorizedError('Rol inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(data.password, row.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email o contraseña incorrectos');
    }

    // Generar tokens
    const tokens = generateTokenPair({
      userId: row.id,
      email: row.email,
      roleId: row.role_id,
    });

    // Construir respuesta
    const user: Omit<UserWithRole, 'password_hash'> = {
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

    return { user, tokens };
  }

  /**
   * Refrescar access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verificar que el usuario aún exista y esté activo
    const userQuery = `
      SELECT u.id, u.email, u.role_id, u.is_active, r.is_active as role_is_active
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;

    const result = await pool.query(userQuery, [payload.userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    if (!user.role_is_active) {
      throw new UnauthorizedError('Rol inactivo');
    }

    // Generar nuevos tokens
    return generateTokenPair({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
    });
  }

  /**
   * Obtener usuario actual por ID
   */
  async getCurrentUser(userId: string): Promise<Omit<UserWithRole, 'password_hash'>> {
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

    const result = await pool.query(query, [userId]);

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
}

export const authService = new AuthService();

