import { z } from 'zod';

export const PurchasePayloadSchema = z.object({
  first_name: z.string().min(1, 'Customer first name required').max(50),
  city: z.string().max(80).optional(),
  item_title: z.string().min(1, 'Item title required').max(200),
  item_image_url: z.string().url().optional().or(z.literal('')),
  product_url: z.string().url().optional().or(z.literal('')),
  amount: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('INR').optional(),
  quantity: z.number().int().positive().default(1).optional()
});

export const SignupPayloadSchema = z.object({
  first_name: z.string().min(1).max(50),
  city: z.string().max(80).optional(),
  action_label: z.string().max(100).default('joined the community').optional()
});

export const InventoryPayloadSchema = z.object({
  item_title: z.string().min(1).max(200),
  item_image_url: z.string().url().optional().or(z.literal('')),
  product_url: z.string().url().optional().or(z.literal('')),
  items_left: z.number().int().nonnegative('Items left cannot be negative')
});

export const IngestEventSchema = z.object({
  website_id: z.string().uuid().optional(),
  event_type: z.enum(['purchase', 'signup', 'registration', 'inventory_update']),
  source_event_id: z.string().min(1, 'source_event_id is required for idempotency').max(255),
  occurred_at: z.string().datetime({ message: 'occurred_at must be a valid ISO-8601 timestamp' }),
  payload: z.record(z.unknown())
}).superRefine((data, ctx) => {
  if (data.event_type === 'purchase') {
    const res = PurchasePayloadSchema.safeParse(data.payload);
    if (!res.success) {
      res.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
      });
    }
  } else if (data.event_type === 'signup' || data.event_type === 'registration') {
    const res = SignupPayloadSchema.safeParse(data.payload);
    if (!res.success) {
      res.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
      });
    }
  } else if (data.event_type === 'inventory_update') {
    const res = InventoryPayloadSchema.safeParse(data.payload);
    if (!res.success) {
      res.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: ['payload', ...issue.path] });
      });
    }
  }
});

export type IngestEventInput = z.infer<typeof IngestEventSchema>;
