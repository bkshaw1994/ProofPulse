import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      apiUrl: env.API_URL,
      docsUrl: `${env.API_URL}/api-docs`
    },
    'ProofPulse API server successfully started'
  );
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Received termination signal. Closing HTTP server gracefully...');
  server.close(() => {
    logger.info('ProofPulse API server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
