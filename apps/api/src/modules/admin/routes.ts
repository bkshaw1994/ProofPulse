import { Router, Request, Response } from 'express';
import { db } from '../../data/store';
import { PlanTier, SubscriptionStatus } from '@proofpulse/shared-types';
import { PLAN_CONFIGS } from '@proofpulse/config';

export const adminRouter = Router();

// GET /api/v1/admin/metrics - Global Platform Aggregates (Real-Time Computed)
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
      total: merchants.length,
      synced_at: new Date().toISOString()
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
      .slice(-15); // last 15 live events
    return {
      ...site,
      campaigns,
      recent_events: events
    };
  });

  // Real audit logs for this workspace
  const logs = db.auditLogs.filter((l) => l.workspace_id === workspace_id).slice(-20);

  res.json({
    data: {
      ...merchant,
      websites_detailed: websitesDetails,
      audit_logs: logs
    }
  });
});

// GET /api/v1/admin/subscriptions - Real-time subscriptions & MRR breakdown
adminRouter.get('/subscriptions', (_req: Request, res: Response) => {
  const merchants = db.getAdminMerchantsList();

  let totalMrr = 0;
  let payingCount = 0;
  const tierStats = {
    free: { count: 0, mrr: 0, price: 0 },
    starter: { count: 0, mrr: 0, price: 499 },
    growth: { count: 0, mrr: 0, price: 1499 },
    agency: { count: 0, mrr: 0, price: 3999 }
  };

  const list = merchants.map((m) => {
    const tier = m.plan_tier as PlanTier;
    const price = PLAN_CONFIGS[tier]?.price_inr || 0;
    const isPaying = m.is_paying;

    if (tierStats[tier]) {
      tierStats[tier].count++;
      if (isPaying) {
        tierStats[tier].mrr += price;
      }
    }

    if (isPaying) {
      totalMrr += price;
      payingCount++;
    }

    return {
      workspace_id: m.workspace_id,
      workspace_name: m.workspace_name,
      owner_name: m.full_name,
      email: m.email,
      plan_tier: tier,
      plan_name: m.plan_name,
      mrr_inr: m.mrr_inr,
      subscription_status: m.subscription_status,
      provider: m.provider,
      provider_subscription_id: m.provider_subscription_id,
      provider_customer_id: m.provider_customer_id,
      current_period_start: m.current_period_start,
      current_period_end: m.current_period_end,
      cancel_at_period_end: m.cancel_at_period_end,
      impressions_used: m.impressions_used,
      impressions_limit: m.impressions_limit,
      quota_usage_percentage: m.quota_usage_percentage,
      registered_at: m.registered_at
    };
  });

  res.json({
    data: {
      total_mrr: totalMrr,
      total_merchants: merchants.length,
      total_paying: payingCount,
      tier_breakdown: tierStats,
      subscriptions: list
    }
  });
});

// GET /api/v1/admin/integrations - Real-time Storefront & Ingestion Inventory
adminRouter.get('/integrations', (_req: Request, res: Response) => {
  const merchants = db.getAdminMerchantsList();
  const integrationsList: any[] = [];

  for (const m of merchants) {
    for (const site of m.websites) {
      const siteEvents = Array.from(db.events.values()).filter((e) => e.website_id === site.id);
      const activeCampaigns = db.listCampaigns(site.id).filter((c) => c.status === 'active');

      integrationsList.push({
        id: site.id,
        workspace_id: m.workspace_id,
        workspace_name: m.workspace_name,
        merchant_email: m.email,
        domain: site.domain,
        canonical_url: site.canonical_url,
        public_key: site.public_key,
        is_verified: site.is_verified,
        verified_at: site.verified_at,
        last_widget_activity_at: site.last_widget_activity_at,
        last_event_at: site.last_event_at,
        total_events: siteEvents.length,
        active_campaigns_count: activeCampaigns.length,
        integration_status: m.integration_status,
        created_at: site.created_at
      });
    }
  }

  res.json({
    data: integrationsList,
    meta: {
      total: integrationsList.length,
      verified_count: integrationsList.filter((i) => i.is_verified).length
    }
  });
});

// GET /api/v1/admin/telemetry - Live System Process & Resource Telemetry
adminRouter.get('/telemetry', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const uptime = Math.floor(process.uptime());

  res.json({
    data: {
      status: 'operational',
      server_time: new Date().toISOString(),
      uptime_seconds: uptime,
      uptime_formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      memory: {
        rss_mb: (mem.rss / (1024 * 1024)).toFixed(2),
        heap_used_mb: (mem.heapUsed / (1024 * 1024)).toFixed(2),
        heap_total_mb: (mem.heapTotal / (1024 * 1024)).toFixed(2),
        external_mb: (mem.external / (1024 * 1024)).toFixed(2)
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      platform_counts: {
        workspaces: db.workspaces.size,
        profiles: db.profiles.size,
        websites: db.websites.size,
        campaigns: db.campaigns.size,
        events_ingested: db.events.size,
        analytics_records: db.analyticsEvents.size,
        subscriptions: db.subscriptions.size,
        audit_logs: db.auditLogs.length
      }
    }
  });
});

// GET /api/v1/admin/audit-logs - Real-time Audit Trail Stream
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  const { limit = '50' } = req.query;
  const max = Math.min(parseInt(String(limit), 10) || 50, 100);

  // Return newest audit logs first
  const logs = [...db.auditLogs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, max);

  res.json({
    data: logs,
    meta: {
      total: db.auditLogs.length,
      limit: max
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

// POST /api/v1/admin/merchants/:workspace_id/simulate-event - Ingest a real verified event
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
    { title: 'Single Origin Malabar Coffee Beans', amount: '₹650', city: 'Kochi', name: 'Kavitha' },
    { title: 'Hand-Carved Sheesham Wood Desk Organizer', amount: '₹1,450', city: 'New Delhi', name: 'Arjun' },
    { title: 'Organic Kashmiri Saffron (1g)', amount: '₹420', city: 'Srinagar', name: 'Zoya' }
  ];
  const picked = sampleItems[Math.floor(Math.random() * sampleItems.length)];
  const sourceId = `sim_order_${Date.now()}`;

  const event = db.insertEvent(
    site.id,
    'shopify',
    'purchase',
    sourceId,
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

  // Audit log the test injection
  db.logAudit(
    workspace_id,
    'event.injected_by_staff',
    'event',
    event.id,
    'internal_operator',
    {
      website_id: site.id,
      item: picked.title,
      amount: picked.amount,
      buyer: picked.name
    }
  );

  res.json({
    data: event,
    message: `Verified purchase of "${picked.title}" (${picked.amount}) ingested in real time!`
  });
});
