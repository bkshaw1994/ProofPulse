import { z } from 'zod';

// Helper to sanitize and normalize domain names
export function normalizeDomain(rawDomain: string): string {
  let cleaned = rawDomain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  return cleaned;
}

export const CreateWebsiteSchema = z.object({
  domain: z
    .string()
    .min(3, 'Domain must be at least 3 characters')
    .max(255, 'Domain must be less than 255 characters')
    .refine((val) => {
      const normalized = normalizeDomain(val);
      // Valid hostname regex: alphanumeric, hyphens, and dots
      return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
        normalized
      ) || normalized.startsWith('localhost');
    }, {
      message: 'Invalid domain format. Example: mystore.com or shop.example.in'
    }),
  workspace_id: z.string().uuid('Invalid workspace ID format').optional()
});

export const UpdateWebsiteSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(255)
    .optional()
});

export type CreateWebsiteInput = z.infer<typeof CreateWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof UpdateWebsiteSchema>;
