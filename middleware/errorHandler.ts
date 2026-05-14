import { Request, Response, NextFunction } from 'express';
import { AppError } from '../src/errors/customErrors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For any other unexpected error, log it and send a generic 500 response.
  console.error('Unhandled Error:', err);
  return res.status(500).json({ error: 'Internal Server Error' });
};
