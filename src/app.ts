/**
 * Configuración de la aplicación Express
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo configura Express
 * - Separation of Concerns: Separado del server startup (index.ts)
 * - Clean Code: Configuración clara y organizada
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares';

/**
 * Crear y configurar aplicación Express
 */
export const createApp = (): Application => {
  const app: Application = express();

  // ============================================
  // Middlewares de seguridad
  // ============================================

  // Helmet: Headers de seguridad
  app.use(helmet());

  // CORS: Control de acceso
  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );

  // ============================================
  // Middlewares de utilidad
  // ============================================

  // Compression: Comprime responses
  app.use(compression());

  // JSON parser: Parsear body JSON
  app.use(express.json({ limit: '10mb' }));

  // URL-encoded parser: Parsear formularios
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Morgan: HTTP request logger
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ============================================
  // Health check
  // ============================================

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // ============================================
  // API Routes
  // ============================================

  // TODO: Registrar rutas aquí
  // app.use(`/api/${config.apiVersion}/auth`, authRoutes);
  // app.use(`/api/${config.apiVersion}/products`, productRoutes);
  // etc...

  app.get(`/api/${config.apiVersion}`, (_req, res) => {
    res.json({
      message: 'DaviStore API',
      version: config.apiVersion,
      documentation: '/api/docs',
    });
  });

  // ============================================
  // Error handling
  // ============================================

  // 404 handler (debe ir después de todas las rutas)
  app.use(notFoundHandler);

  // Error handler global (debe ser el último middleware)
  app.use(errorHandler);

  return app;
};

export default createApp;

