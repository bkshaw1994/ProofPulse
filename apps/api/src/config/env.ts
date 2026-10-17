import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_URL: z.string().default('http://localhost:4000'),
  DASHBOARD_URL: z.string().default('http://localhost:5173'),
  WIDGET_CDN_URL: z.string().default('http://localhost:4000/widget/proofpulse.js'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SHOPIFY_WEBHOOK_SECRET: z.string().default('test_shopify_secret_12345'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_sample'),
  RAZORPAY_KEY_SECRET: z.string().default('sample_razorpay_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('sample_webhook_secret'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000')
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadEnv(): EnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables configuration:', result.error.format());
    throw new Error('Environment configuration error');
  }
  return result.data;
}

export const env = loadEnv();
