/**
 * Configuración de la conexión a PostgreSQL
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo maneja configuración de BD
 * - Dependency Inversion: Exporta pool que puede ser inyectado
 * - Clean Code: Validación de variables de entorno
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Validación de variables de entorno requeridas
 * @throws Error si falta alguna variable crítica
 */
const validateEnvVariables = (): void => {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file.'
    );
  }
};

// Validar antes de crear configuración
validateEnvVariables();

/**
 * Configuración del pool de conexiones
 */
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10), // Máximo de conexiones
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // Timeout de conexión: 2s
};

/**
 * Pool de conexiones a PostgreSQL
 * 
 * Beneficios del pool:
 * - Reutilización de conexiones (performance)
 * - Manejo automático de recursos
 * - Límite de conexiones concurrentes
 */
export const pool = new Pool(poolConfig);

/**
 * Evento: conexión exitosa
 */
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

/**
 * Evento: error en el pool
 */
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Función helper para cerrar el pool
 * Útil para tests y shutdown graceful
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('🔒 Database pool closed');
};

/**
 * Test de conexión a la base de datos
 * @returns Promise<boolean> true si la conexión es exitosa
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ Database connection test successful');
    console.log('   Server time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

export default pool;

