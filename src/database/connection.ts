/**
 * Conexión a la base de datos PostgreSQL
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja conexión a BD
 * - Dependency Inversion: Exporta abstracción (pool)
 */

import { Pool } from 'pg';
import { config } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Pool de conexiones de PostgreSQL
 */
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.maxConnections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Manejar errores del pool
 */
pool.on('error', (err) => {
  logger.error('Error inesperado en pool de PostgreSQL', err);
});

/**
 * Probar conexión a la base de datos
 */
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Database connection test successful');
  } catch (error) {
    logger.error('❌ Database connection test failed', error);
    throw error;
  }
};

/**
 * Cerrar pool de conexiones
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  logger.info('Database pool closed');
};

