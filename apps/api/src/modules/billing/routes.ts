import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';
import { env } from '../../config/env';
import { PLAN_CONFIGS } from '@proofpulse/config';
import { PlanTier } from '@proofpulse/shared-types';
import { HTTP_HEADERS } from '@proofpulse/config';
import { logger } from '../../lib/logger';

export const billingRouter = Router();

// List all plans
billingRouter.get('/plans', (_req: Request, res: Response) => {
  res.status(200).json({ data: Object.values(PLAN_CONFIGS) });
});

// Get current workspace subscription
billingRouter.get('/subscription', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const workspaces = db.getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    throw new AppError('No active workspace found.', 404);
  }

  const workspaceId = (req.query.workspace_id as string) || workspaces[0].id;
  const sub = db.getSubscription(workspaceId);
  const plan = PLAN_CONFIGS[sub?.plan_tier || 'free'];

  res.status(200).json({
    data: {
      subscription: sub,
      plan
    }
  });
});

// Upgrade or change subscription tier
billingRouter.post('/upgrade', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { plan_tier, workspace_id } = req.body;

  if (!plan_tier || !PLAN_CONFIGS[plan_tier as PlanTier]) {
    throw new AppError('Invalid plan_tier requested.', 400);
  }

  const workspaces = db.getUserWorkspaces(user.id);
  const targetWorkspace = workspace_id
    ? workspaces.find((w) => w.id === workspace_id)
    : workspaces[0];

  if (!targetWorkspace || (targetWorkspace.role !== 'owner' && targetWorkspace.role !== 'admin')) {
    throw new AppError('Forbidden: Only workspace owner can change subscriptions.', 403);
  }

  const updatedSub = db.updateSubscriptionPlan(targetWorkspace.id, plan_tier as PlanTier);
  db.logAudit(targetWorkspace.id, 'subscription.changed', 'subscription', updatedSub.id, user.id, {
    new_tier: plan_tier
  });

  res.status(200).json({
    data: {
      subscription: updatedSub,
      plan: PLAN_CONFIGS[plan_tier as PlanTier]
    }
  });
});

// Razorpay Billing Webhook Ingestion
billingRouter.post('/webhook', (req: Request, res: Response) => {
  const signature = req.headers[HTTP_HEADERS.RAZORPAY_SIGNATURE] as string;

  if (signature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
      if (!match) {
        logger.warn('Razorpay signature mismatch');
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const eventPayload = req.body;
  const eventId = eventPayload.event_id || eventPayload.id || `evt_${Date.now()}`;
  const receiptKey = `razorpay:${eventId}`;

  // Idempotency check
  if (db.billingReceipts.has(receiptKey)) {
    res.status(200).json({ status: 'idempotent_duplicate' });
    return;
  }
  db.billingReceipts.add(receiptKey);

  logger.info({ eventType: eventPayload.event }, 'Razorpay billing webhook processed');

  res.status(200).json({ status: 'success' });
});
