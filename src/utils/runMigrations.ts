/**
 * Ejecuta las migraciones automáticamente al iniciar
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

export async function runMigrations(pool: Pool): Promise<void> {
  try {
    logger.info('🗄️  Checking if migrations are needed...');

    // Verificar si la tabla categories existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);

    const tablesExist = checkTable.rows[0].exists;

    if (tablesExist) {
      logger.info('✅ Database already migrated, skipping migrations');
      return;
    }

    logger.info('📄 Running database migrations...');

    // Ejecutar migración 001
    logger.info('  → Running 001_initial_schema.sql...');
    const migration1Path = join(__dirname, '..', 'database', 'migrations', '001_initial_schema.sql');
    logger.info(`  → Migration path: ${migration1Path}`);
    const migration1 = readFileSync(migration1Path, 'utf8');
    await pool.query(migration1);
    logger.info('  ✅ Migration 001 completed');

    // Ejecutar migración 002
    logger.info('  → Running 002_add_order_statuses.sql...');
    const migration2Path = join(__dirname, '..', 'database', 'migrations', '002_add_order_statuses.sql');
    logger.info(`  → Migration path: ${migration2Path}`);
    const migration2 = readFileSync(migration2Path, 'utf8');
    await pool.query(migration2);
    logger.info('  ✅ Migration 002 completed');

    logger.info('🎉 All migrations completed successfully!');
  } catch (error) {
    logger.error('❌ Error running migrations:', error);
    throw error;
  }
}

