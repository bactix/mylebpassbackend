import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
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
  } else if (err instanceof MongooseError.CastError) {
    res.status(400).json(ResponseHelper.error(`Invalid value for field '${err.path}'`));
  } else if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    res.status(422).json(ResponseHelper.error(messages));
  } else {
    logger.error('Unexpected error:', err);
    res
      .status(500)
      .json(ResponseHelper.error('An unexpected error occurred', 'Internal Server Error'));
  }
};
