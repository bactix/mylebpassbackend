import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes - App & Dashboard
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Route ${req.path} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};
