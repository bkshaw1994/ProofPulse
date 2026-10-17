import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';
import { IngestEventSchema } from '@proofpulse/validation';
import { HTTP_HEADERS } from '@proofpulse/config';

export const eventsRouter = Router();

// Ingest a verified event via server API key or session
eventsRouter.post('/', (req: Request, res: Response) => {
  let websiteId: string | undefined;

  // 1. Try private API key authentication
  const apiKeyHeader = req.headers[HTTP_HEADERS.API_KEY] as string;
  if (apiKeyHeader) {
    const site = db.getWebsiteByApiKey(apiKeyHeader);
    if (!site) {
      throw new AppError('Invalid or revoked X-ProofPulse-Key.', 401);
    }
    websiteId = site.id;
  } else if (req.user) {
    // 2. Try session user auth
    websiteId = req.body.website_id;
  } else {
    throw new AppError('Authentication required: Provide X-ProofPulse-Key or Bearer token.', 401);
  }

  if (!websiteId) {
    throw new AppError('website_id could not be determined.', 400);
  }

  const site = db.getWebsiteById(websiteId);
  if (!site) {
    throw new AppError('Associated website not found.', 404);
  }

  // Validate incoming payload
  const validated = IngestEventSchema.parse({
    ...req.body,
    website_id: websiteId
  });

  const source = 'api';

  // 3. Idempotency Check: Reject/Return early on duplicate deliveries
  const isDuplicate = db.checkEventExists(websiteId, source, validated.source_event_id);
  if (isDuplicate) {
    res.status(200).json({
      status: 'idempotent_duplicate',
      message: 'Event already received and processed previously.',
      source_event_id: validated.source_event_id
    });
    return;
  }

  // 4. Data Minimization & Anonymization
  const raw = validated.payload as any;
  const anonymizedPayload: Record<string, unknown> = {
    first_name: raw.first_name,
    city: raw.city || undefined,
    item_title: raw.item_title,
    item_image_url: raw.item_image_url || undefined,
    product_url: raw.product_url || undefined,
    quantity: raw.quantity || 1
  };

  if (raw.amount) {
    anonymizedPayload.amount_formatted = `₹${raw.amount}`;
  }
  if (raw.items_left !== undefined) {
    anonymizedPayload.items_left = raw.items_left;
  }
  if (raw.action_label) {
    anonymizedPayload.action_label = raw.action_label;
  }

  // 5. Persist event
  const event = db.insertEvent(
    websiteId,
    source,
    validated.event_type,
    validated.source_event_id,
    validated.occurred_at,
    anonymizedPayload
  );

  res.status(202).json({
    success: true,
    event_id: event.id,
    status: event.processing_status
  });
});

// List recent events for a website (Dashboard view)
eventsRouter.get('/websites/:websiteId/events', requireAuth, (req: Request, res: Response) => {
  const { websiteId } = req.params;
  const site = db.getWebsiteById(websiteId);
  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const userWorkspaces = db.getUserWorkspaces(req.user!.id);
  const belongs = userWorkspaces.some((w) => w.id === site.workspace_id);
  if (!belongs) {
    throw new AppError('Forbidden: Access denied to website events.', 403);
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const events = db.listEvents(websiteId, Math.min(limit, 100));

  res.status(200).json({ data: events });
});
