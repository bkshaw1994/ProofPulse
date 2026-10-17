import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { correlationIdMiddleware } from './middleware/correlationId';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

// Module routers
import { healthRouter } from './modules/health/routes';
import { authRouter } from './modules/auth/routes';
import { websitesRouter } from './modules/websites/routes';
import { campaignsRouter } from './modules/campaigns/routes';
import { eventsRouter } from './modules/events/routes';
import { widgetRouter } from './modules/widget/routes';
import { analyticsRouter } from './modules/analytics/routes';
import { integrationsRouter } from './modules/integrations/routes';
import { billingRouter } from './modules/billing/routes';

export function createApp(): Express {
  const app = express();

  // 1. Security & Headers
  app.use(
    helmet({
      contentSecurityPolicy: false // Allow Swagger UI assets in dev
    })
  );

  const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or widget on merchant stores)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        // Public widget endpoints allow merchant origins
        return callback(null, true);
      },
      credentials: true
    })
  );

  // 2. Body Parser with Raw Body preservation for HMAC verification
  app.use(
    express.json({
      limit: '1mb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        (req as any).rawBody = buf.toString('utf8');
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 3. Tracing & Authentication
  app.use(correlationIdMiddleware);
  app.use(authMiddleware);

  // 4. API Documentation (Swagger UI)
  try {
    const openApiFilePath = path.resolve(__dirname, '../../../docs/api/openapi.yaml');
    const swaggerDoc = YAML.load(openApiFilePath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  } catch (err) {
    // If running in standalone build dist
    console.warn('Could not load openapi.yaml for Swagger UI:', err);
  }

  // 5. System Health Endpoints
  app.use('/', healthRouter);

  // 6. API v1 Subsystems
  const apiV1 = express.Router();
  apiV1.use('/', authRouter);
  apiV1.use('/websites', websitesRouter);
  apiV1.use('/', campaignsRouter);
  apiV1.use('/events', eventsRouter);
  apiV1.use('/widget', widgetRouter);
  apiV1.use('/', analyticsRouter);
  apiV1.use('/integrations', integrationsRouter);
  apiV1.use('/billing', billingRouter);

  app.use('/api/v1', apiV1);

  // 7. 404 Route Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'The requested resource or endpoint was not found on ProofPulse API.'
    });
  });

  // 8. Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}
