import dotenv from 'dotenv';
import { createApp } from './app';
import logger from './config/logger';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
