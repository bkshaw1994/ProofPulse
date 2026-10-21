import { Router, Request, Response } from 'express';
import { db } from '../../data/store';
import { PlanTier, SubscriptionStatus } from '@proofpulse/shared-types';

export const adminRouter = Router();

// GET /api/v1/admin/metrics - Global Platform Aggregates
adminRouter.get('/metrics', (_req: Request, res: Response) => {
  const metrics = db.getAdminMetricsSummary();
  res.json({ data: metrics });
});

// GET /api/v1/admin/merchants - List merchants with integration & membership details
adminRouter.get('/merchants', (req: Request, res: Response) => {
  const { search, integration_status, plan_tier, subscription_status } = req.query;

  const merchants = db.getAdminMerchantsList({
    search: search ? String(search) : undefined,
    integration_status: integration_status ? String(integration_status) : undefined,
    plan_tier: plan_tier ? String(plan_tier) : undefined,
    subscription_status: subscription_status ? String(subscription_status) : undefined
  });

  res.json({
    data: merchants,
    meta: {
      total: merchants.length
    }
  });
});

// GET /api/v1/admin/merchants/:workspace_id - Deep dive merchant details
adminRouter.get('/merchants/:workspace_id', (req: Request, res: Response) => {
  const { workspace_id } = req.params;
  const ws = db.getWorkspace(workspace_id);
  if (!ws) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Merchant workspace not found.' });
  }

  const merchants = db.getAdminMerchantsList();
  const merchant = merchants.find((m) => m.workspace_id === workspace_id);
  if (!merchant) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Merchant record not found.' });
  }

  // Get campaigns and recent events for all merchant websites
  const websitesDetails = merchant.websites.map((site) => {
    const campaigns = db.listCampaigns(site.id);
    const events = Array.from(db.events.values())
      .filter((e) => e.website_id === site.id)
      .slice(-10); // last 10 events
    return {
      ...site,
      campaigns,
      recent_events: events
    };
  });

  // Recent audit logs
  const logs = db.auditLogs.filter((l) => l.workspace_id === workspace_id).slice(-15);

  res.json({
    data: {
      ...merchant,
      websites_detailed: websitesDetails,
      audit_logs: logs
    }
  });
});

// PATCH /api/v1/admin/merchants/:workspace_id/subscription - Staff override plan/status
adminRouter.patch('/merchants/:workspace_id/subscription', (req: Request, res: Response) => {
  const { workspace_id } = req.params;
  const { plan_tier, status, reason } = req.body;

  if (!plan_tier || !['free', 'starter', 'growth', 'agency'].includes(plan_tier)) {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Valid plan_tier (free, starter, growth, agency) is required.'
    });
  }

  const validStatuses: SubscriptionStatus[] = ['active', 'past_due', 'canceled', 'trialing'];
  const subStatus: SubscriptionStatus = status && validStatuses.includes(status) ? status : 'active';

  const updatedSub = db.adminUpdateSubscription(
    workspace_id,
    plan_tier as PlanTier,
    subStatus,
    reason || 'Manual staff adjustment via internal portal'
  );

  res.json({
    data: updatedSub,
    message: `Merchant plan successfully updated to ${plan_tier} (${subStatus}).`
  });
});

// POST /api/v1/admin/merchants/:workspace_id/simulate-event - Internal testing helper
adminRouter.post('/merchants/:workspace_id/simulate-event', (req: Request, res: Response) => {
  const { workspace_id } = req.params;
  const sites = db.listWebsites(workspace_id);
  if (sites.length === 0) {
    return res.status(400).json({ error: 'NO_WEBSITE', message: 'Merchant has no website registered.' });
  }

  const site = sites[0];
  const sampleItems = [
    { title: 'Silk Saree with Zari Border', amount: '₹4,999', city: 'Bengaluru', name: 'Divya' },
    { title: 'Artisan Terracotta Chai Cups (Set of 6)', amount: '₹899', city: 'Jaipur', name: 'Manish' },
    { title: 'Single Origin Malabar Coffee Beans', amount: '₹650', city: 'Kochi', name: 'Kavitha' }
  ];
  const picked = sampleItems[Math.floor(Math.random() * sampleItems.length)];

  const event = db.insertEvent(
    site.id,
    'internal_admin_simulator',
    'purchase',
    `sim_${Date.now()}`,
    new Date().toISOString(),
    {
      first_name: picked.name,
      city: picked.city,
      item_title: picked.title,
      amount_formatted: picked.amount,
      quantity: 1
    }
  );

  site.last_event_at = new Date().toISOString();
  site.last_widget_activity_at = new Date().toISOString();

  res.json({
    data: event,
    message: 'Simulated purchase event ingested and widget activity recorded.'
  });
});
