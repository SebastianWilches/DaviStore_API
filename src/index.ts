/**
 * Punto de entrada de la aplicación
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo inicia el servidor
 * - Separation of Concerns: App config separada (app.ts)
 * - Clean Code: Startup limpio con validaciones
 */

import { createApp } from './app';
import { config, validateConfig } from './config/env';
import { testConnection, closePool } from './config/database';
import { logger } from './utils/logger';

/**
 * Inicializar y arrancar el servidor
 */
const startServer = async (): Promise<void> => {
  try {
    // 1. Validar configuración
    logger.info('🔍 Validating configuration...');
    validateConfig();

    // 2. Probar conexión a base de datos
    logger.info('🗄️  Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // 3. Crear aplicación Express
    logger.info('🚀 Creating Express application...');
    const app = createApp();

    // 4. Iniciar servidor
    const server = app.listen(config.port, () => {
      logger.info(`✅ Server started successfully`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Server running on port ${config.port}`);
      logger.info(`🔗 API available at: http://localhost:${config.port}/api/${config.apiVersion}`);
      logger.info(`❤️  Health check: http://localhost:${config.port}/health`);
    });

    // ============================================
    // Graceful shutdown
    // ============================================

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received, shutting down gracefully...`);

      // Cerrar servidor (dejar de aceptar nuevas conexiones)
      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      // Cerrar pool de base de datos
      await closePool();

      logger.info('👋 Shutdown complete, exiting...');
      process.exit(0);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Manejar errores no capturados
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('❌ Unhandled Rejection:', reason);
      throw reason;
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar aplicación
startServer();

