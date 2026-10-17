import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    service: 'proofpulse-api',
    version: '1.0.0'
  });
});

healthRouter.get('/ready', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});
