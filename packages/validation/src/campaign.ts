import { z } from 'zod';

export const NotificationTypeEnum = z.enum([
  'recent_purchase',
  'recent_signup',
  'product_popularity',
  'live_visitors',
  'low_stock',
  'genuine_countdown'
]);

export const CampaignPositionEnum = z.enum([
  'bottom_left',
  'bottom_right',
  'top_left',
  'top_right'
]);

export const CampaignThemeEnum = z.enum([
  'light',
  'dark',
  'minimal',
  'glassmorphic'
]);

export const PageRulesSchema = z.object({
  mode: z.enum(['all', 'include', 'exclude']).default('all'),
  paths: z.array(z.string()).default([])
});

export const DeviceTargetingSchema = z.object({
  desktop: z.boolean().default(true),
  mobile: z.boolean().default(true)
});

export const CampaignConfigSchema = z.object({
  headline_template: z.string().max(120).optional(),
  cta_url: z.string().url().or(z.string().startsWith('/')).optional(),
  min_events_threshold: z.number().int().min(1).max(1000).optional(),
  countdown_end_time: z.string().datetime().optional(),
  stock_threshold: z.number().int().min(1).max(100).optional()
});

export const BaseCampaignSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  notification_type: NotificationTypeEnum,
  position: CampaignPositionEnum.default('bottom_left'),
  theme: CampaignThemeEnum.default('light'),
  duration_seconds: z.number().int().min(3).max(30).default(6),
  initial_delay_seconds: z.number().int().min(0).max(60).default(3),
  display_frequency_minutes: z.number().int().min(0).max(120).default(5),
  event_freshness_hours: z.number().int().min(1).max(720).default(48),
  page_rules: PageRulesSchema.default({ mode: 'all', paths: [] }),
  device_targeting: DeviceTargetingSchema.default({ desktop: true, mobile: true }),
  config: CampaignConfigSchema.default({}),
  start_time: z.string().datetime().nullable().optional(),
  end_time: z.string().datetime().nullable().optional()
});

export const CreateCampaignSchema = BaseCampaignSchema.refine((data) => {
  // If countdown notification, end_time or countdown_end_time must be set and in the future
  if (data.notification_type === 'genuine_countdown') {
    const deadline = data.config.countdown_end_time || data.end_time;
    if (!deadline) {
      return false;
    }
  }
  return true;
}, {
  message: 'Genuine countdown campaigns require an explicit and genuine future deadline timestamp.',
  path: ['config', 'countdown_end_time']
});

export const UpdateCampaignSchema = BaseCampaignSchema.partial();

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
