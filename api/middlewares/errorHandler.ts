import { Request, Response, NextFunction } from 'express';
import { AppError } from '../helpers/errors';
import { ResponseHelper } from '../helpers/response';
import logger from '../config/logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message} (${err.statusCode})`);
    res.status(err.statusCode).json(ResponseHelper.error(err.message));
  } else {
    logger.error('Unexpected error:', err);
    res
      .status(500)
      .json(ResponseHelper.error('An unexpected error occurred', 'Internal Server Error'));
  }
};
