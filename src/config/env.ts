/**
 * Configuración centralizada de variables de entorno
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja configuración
 * - DRY: Variables centralizadas en un solo lugar
 * - Type Safety: Tipado estricto con TypeScript
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Interface para las variables de entorno
 * Proporciona type-safety y autocomplete
 */
interface EnvConfig {
  // Server
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  apiVersion: string;

  // Database
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    maxConnections: number;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Security
  bcryptRounds: number;

  // CORS
  allowedOrigins: string[];

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Obtener variable de entorno con valor por defecto
 */
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  return value;
};

/**
 * Convertir string a array separado por comas
 */
const parseArray = (value: string): string[] => {
  return value.split(',').map((item) => item.trim());
};

/**
 * Configuración exportada
 */
const envConfig: EnvConfig = {
  // Server Configuration
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  port: parseInt(getEnv('PORT', '3000'), 10),
  apiVersion: getEnv('API_VERSION', 'v1'),

  // Database Configuration
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    name: getEnv('DB_NAME', 'davistore_db'),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD'),
    maxConnections: parseInt(getEnv('DB_MAX_CONNECTIONS', '20'), 10),
  },

  // JWT Configuration
  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // Security Configuration
  bcryptRounds: parseInt(getEnv('BCRYPT_ROUNDS', '10'), 10),

  // CORS Configuration
  allowedOrigins: parseArray(
    getEnv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173')
  ),

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutos
    maxRequests: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
};

/**
 * Configuración con accesos directos para compatibilidad
 */
export const config = {
  ...envConfig,
  // Accesos directos para JWT
  jwtSecret: envConfig.jwt.secret,
  jwtExpiresIn: envConfig.jwt.expiresIn,
  jwtRefreshSecret: envConfig.jwt.refreshSecret,
  jwtRefreshExpiresIn: envConfig.jwt.refreshExpiresIn,
};

/**
 * Validar configuración al inicio
 */
export const validateConfig = (): void => {
  const errors: string[] = [];

  // Validar puerto
  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  // Validar JWT secrets (no deben ser los defaults en producción)
  if (config.nodeEnv === 'production') {
    if (config.jwt.secret.includes('change_this')) {
      errors.push('JWT_SECRET must be changed in production');
    }
    if (config.jwt.refreshSecret.includes('change_this')) {
      errors.push('JWT_REFRESH_SECRET must be changed in production');
    }
  }

  // Validar bcrypt rounds
  if (config.bcryptRounds < 10 || config.bcryptRounds > 15) {
    errors.push('BCRYPT_ROUNDS should be between 10 and 15');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  console.log('✅ Configuration validated successfully');
};

export default config;

