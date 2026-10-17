import { z } from 'zod';

export const TrackTelemetrySchema = z.object({
  website_id: z.string().min(1, 'website_id is required'),
  campaign_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  event_type: z.enum(['impression', 'click', 'dismissal']),
  visitor_id_hash: z.string().min(8, 'visitor_id_hash must be at least 8 characters').max(128),
  page_url: z.string().max(2048).optional()
});

export type TrackTelemetryInput = z.infer<typeof TrackTelemetrySchema>;
