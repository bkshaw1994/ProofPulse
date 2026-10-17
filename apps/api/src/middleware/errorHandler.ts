import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { ApiErrorResponse } from '@proofpulse/shared-types';

export class AppError extends Error {
  public statusCode: number;
  public details?: Array<{ path: string; message: string }>;

  constructor(message: string, statusCode = 400, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = (req as any).correlationId || 'unknown';

  if (err instanceof ZodError || err.name === 'ZodError' || 'issues' in (err as any)) {
    const issues = (err as any).issues || [];
    const details = issues.map((i: any) => ({
      path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
      message: i.message
    }));

    logger.warn({ correlationId, issues: details }, 'Request validation failed');

    const response: ApiErrorResponse = {
      error: 'VALIDATION_ERROR',
      message: 'Request payload failed schema validation',
      correlation_id: correlationId,
      details
    };
    res.status(400).json(response);
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ correlationId, statusCode: err.statusCode, err: err.message }, 'Application operational error');
    const response: ApiErrorResponse = {
      error: 'APPLICATION_ERROR',
      message: err.message,
      correlation_id: correlationId,
      details: err.details
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unhandled / 500 error: log full stack in server logs, never leak internal details to client
  logger.error({ correlationId, err: err.stack || err.message }, 'Unhandled internal server error');

  const response: ApiErrorResponse = {
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred. Please contact support with the correlation ID.',
    correlation_id: correlationId
  };
  res.status(500).json(response);
}
