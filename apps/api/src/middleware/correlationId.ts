import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { HTTP_HEADERS } from '@proofpulse/config';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerName = HTTP_HEADERS.CORRELATION_ID;
  const correlationId = (req.headers[headerName] as string) || crypto.randomUUID();
  req.headers[headerName] = correlationId;
  res.setHeader(headerName, correlationId);
  (req as any).correlationId = correlationId;
  next();
}
