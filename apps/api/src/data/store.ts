import crypto from 'crypto';
import {
  UserProfile,
  Workspace,
  WorkspaceMember,
  Website,
  Campaign,
  EventRecord,
  AnalyticsEvent,
  Subscription,
  UsageCounter,
  AuditLog,
  EventType,
  PlanTier
} from '@proofpulse/shared-types';
import { PLAN_CONFIGS } from '@proofpulse/config';

export class DataStore {
  public profiles: Map<string, UserProfile> = new Map();
  public workspaces: Map<string, Workspace> = new Map();
  public workspaceMembers: Map<string, WorkspaceMember> = new Map();
  public websites: Map<string, Website> = new Map();
  public websiteApiKeys: Map<string, string> = new Map(); // website_id -> hashed_key
  public rawApiKeys: Map<string, string> = new Map(); // hashed_key -> website_id
  public campaigns: Map<string, Campaign> = new Map();
  public events: Map<string, EventRecord> = new Map();
  public analyticsEvents: Map<string, AnalyticsEvent> = new Map();
  public subscriptions: Map<string, Subscription> = new Map();
  public usageCounters: Map<string, UsageCounter> = new Map();
  public auditLogs: AuditLog[] = [];
  public billingReceipts: Set<string> = new Set(); // provider:event_id

  constructor() {
    this.seedDefaultData();
  }

  public hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  private seedDefaultData() {
    const userId = '00000000-0000-0000-0000-000000000001';
    const workspaceId = '10000000-0000-0000-0000-000000000001';
    const websiteId = '20000000-0000-0000-0000-000000000001';
    const campaignId = '30000000-0000-0000-0000-000000000001';

    // 1. Profile
    this.profiles.set(userId, {
      id: userId,
      email: 'demo@proofpulse.in',
      full_name: 'Aarav Patel',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 2. Workspace
    this.workspaces.set(workspaceId, {
      id: workspaceId,
      name: 'Patel E-Commerce Group',
      slug: 'patel-ecommerce',
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    });

    // 3. Member
    const memberId = 'member-001';
    this.workspaceMembers.set(memberId, {
      id: memberId,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'owner',
      created_at: new Date().toISOString()
    });

    // 4. Website
    const defaultRawApiKey = 'pp_sec_test_secret_key_123';
    const hashedApiKey = this.hashKey(defaultRawApiKey);

    this.websites.set(websiteId, {
      id: websiteId,
      workspace_id: workspaceId,
      domain: 'demo-store.myshopify.com',
      canonical_url: 'https://demo-store.myshopify.com',
      public_key: 'pp_pub_live_demo12345',
      verification_token: 'proofpulse-verify-test-token',
      is_verified: true,
      verified_at: new Date().toISOString(),
      last_event_at: new Date().toISOString(),
      last_widget_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    });

    this.websiteApiKeys.set(websiteId, hashedApiKey);
    this.rawApiKeys.set(hashedApiKey, websiteId);

    // 5. Campaign
    this.campaigns.set(campaignId, {
      id: campaignId,
      website_id: websiteId,
      name: 'Recent Verified Purchases',
      notification_type: 'recent_purchase',
      status: 'active',
      priority: 1,
      position: 'bottom_left',
      theme: 'light',
      duration_seconds: 6,
      initial_delay_seconds: 3,
      display_frequency_minutes: 5,
      event_freshness_hours: 48,
      page_rules: { mode: 'all', paths: [] },
      device_targeting: { desktop: true, mobile: true },
      config: { headline_template: 'Someone recently purchased' },
      start_time: null,
      end_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 6. Verified Event
    const eventId = '40000000-0000-0000-0000-000000000001';
    this.events.set(eventId, {
      id: eventId,
      website_id: websiteId,
      source: 'shopify',
      event_type: 'purchase',
      source_event_id: 'shopify_order_1001',
      occurred_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      normalized_payload: {
        first_name: 'Ananya',
        city: 'Mumbai',
        item_title: 'Handcrafted Brass Lamp',
        item_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150',
        amount_formatted: '₹1,899',
        quantity: 1
      },
      processing_status: 'processed',
      is_verified: true,
      created_at: new Date().toISOString()
    });

    // 7. Subscription
    this.subscriptions.set(workspaceId, {
      id: 'sub-001',
      workspace_id: workspaceId,
      plan_tier: 'growth',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: 'sub_demo_growth_01',
      provider_customer_id: 'cust_demo_01',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 5,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 25,
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // 8. Usage counter
    const currentMonth = new Date().toISOString().slice(0, 7);
    this.usageCounters.set(`${workspaceId}:${currentMonth}`, {
      id: `usage-${workspaceId}-${currentMonth}`,
      workspace_id: workspaceId,
      period_month: currentMonth,
      impression_count: 1420,
      event_count: 85,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Profiles & Workspaces
  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.get(id);
  }

  public getProfileByEmail(email: string): UserProfile | undefined {
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === email.toLowerCase()) return p;
    }
    return undefined;
  }

  public createProfile(profile: UserProfile): UserProfile {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  public getUserWorkspaces(userId: string): Array<Workspace & { role: string }> {
    const results: Array<Workspace & { role: string }> = [];
    for (const member of this.workspaceMembers.values()) {
      if (member.user_id === userId) {
        const ws = this.workspaces.get(member.workspace_id);
        if (ws && !ws.deleted_at) {
          results.push({ ...ws, role: member.role });
        }
      }
    }
    return results;
  }

  public createWorkspace(name: string, ownerId: string, slug?: string): Workspace {
    const id = crypto.randomUUID();
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id.slice(0, 4);
    const ws: Workspace = {
      id,
      name,
      slug: generatedSlug,
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    this.workspaces.set(id, ws);

    // Add membership
    const memberId = crypto.randomUUID();
    this.workspaceMembers.set(memberId, {
      id: memberId,
      workspace_id: id,
      user_id: ownerId,
      role: 'owner',
      created_at: new Date().toISOString()
    });

    // Default free subscription
    this.subscriptions.set(id, {
      id: crypto.randomUUID(),
      workspace_id: id,
      plan_tier: 'free',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: null,
      provider_customer_id: null,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return ws;
  }

  // Websites
  public listWebsites(workspaceId: string): Website[] {
    const list: Website[] = [];
    for (const site of this.websites.values()) {
      if (site.workspace_id === workspaceId && !site.deleted_at) {
        list.push(site);
      }
    }
    return list;
  }

  public getWebsiteById(id: string): Website | undefined {
    const site = this.websites.get(id);
    return site && !site.deleted_at ? site : undefined;
  }

  public getWebsiteByPublicKey(publicKey: string): Website | undefined {
    for (const site of this.websites.values()) {
      if (site.public_key === publicKey && !site.deleted_at) {
        return site;
      }
    }
    return undefined;
  }

  public getWebsiteByApiKey(rawKey: string): Website | undefined {
    const hash = this.hashKey(rawKey);
    const siteId = this.rawApiKeys.get(hash);
    if (!siteId) return undefined;
    return this.getWebsiteById(siteId);
  }

  public createWebsite(workspaceId: string, domain: string): { website: Website; rawApiKey: string } {
    const id = crypto.randomUUID();
    const publicKey = `pp_pub_live_${crypto.randomBytes(12).toString('hex')}`;
    const rawApiKey = `pp_sec_live_${crypto.randomBytes(24).toString('hex')}`;
    const hashedApiKey = this.hashKey(rawApiKey);
    const verificationToken = `proofpulse-verify-${crypto.randomBytes(8).toString('hex')}`;

    const canonicalUrl = domain.startsWith('http') ? domain : `https://${domain}`;

    const site: Website = {
      id,
      workspace_id: workspaceId,
      domain,
      canonical_url: canonicalUrl,
      public_key: publicKey,
      verification_token: verificationToken,
      is_verified: false,
      verified_at: null,
      last_event_at: null,
      last_widget_activity_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    this.websites.set(id, site);
    this.websiteApiKeys.set(id, hashedApiKey);
    this.rawApiKeys.set(hashedApiKey, id);

    return { website: site, rawApiKey };
  }

  public updateWebsite(id: string, updates: Partial<Website>): Website | undefined {
    const site = this.websites.get(id);
    if (!site || site.deleted_at) return undefined;
    const updated = { ...site, ...updates, updated_at: new Date().toISOString() };
    this.websites.set(id, updated);
    return updated;
  }

  public deleteWebsite(id: string): boolean {
    const site = this.websites.get(id);
    if (!site) return false;
    site.deleted_at = new Date().toISOString();
    return true;
  }

  // Campaigns
  public listCampaigns(websiteId: string): Campaign[] {
    const list: Campaign[] = [];
    for (const c of this.campaigns.values()) {
      if (c.website_id === websiteId && c.status !== 'archived') {
        list.push(c);
      }
    }
    return list;
  }

  public getCampaignById(id: string): Campaign | undefined {
    const c = this.campaigns.get(id);
    return c && c.status !== 'archived' ? c : undefined;
  }

  public createCampaign(websiteId: string, data: Omit<Campaign, 'id' | 'website_id' | 'created_at' | 'updated_at'>): Campaign {
    const id = crypto.randomUUID();
    const campaign: Campaign = {
      id,
      website_id: websiteId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  public updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const c = this.campaigns.get(id);
    if (!c) return undefined;
    const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
    this.campaigns.set(id, updated);
    return updated;
  }

  public deleteCampaign(id: string): boolean {
    const c = this.campaigns.get(id);
    if (!c) return false;
    c.status = 'archived';
    return true;
  }

  // Events & Ingestion
  public checkEventExists(websiteId: string, source: string, sourceEventId: string): boolean {
    for (const e of this.events.values()) {
      if (e.website_id === websiteId && e.source === source && e.source_event_id === sourceEventId) {
        return true;
      }
    }
    return false;
  }

  public insertEvent(
    websiteId: string,
    source: string,
    eventType: EventType,
    sourceEventId: string,
    occurredAt: string,
    normalizedPayload: Record<string, unknown>
  ): EventRecord {
    const id = crypto.randomUUID();
    const event: EventRecord = {
      id,
      website_id: websiteId,
      source,
      event_type: eventType,
      source_event_id: sourceEventId,
      occurred_at: occurredAt,
      normalized_payload: normalizedPayload as any,
      processing_status: 'processed',
      is_verified: true,
      created_at: new Date().toISOString()
    };
    this.events.set(id, event);

    // Update website last_event_at
    const site = this.websites.get(websiteId);
    if (site) {
      site.last_event_at = new Date().toISOString();
    }

    // Increment usage
    this.incrementEventUsage(site?.workspace_id);

    return event;
  }

  public listEvents(websiteId: string, limit = 50): EventRecord[] {
    const list: EventRecord[] = [];
    for (const e of this.events.values()) {
      if (e.website_id === websiteId) {
        list.push(e);
      }
    }
    return list
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, limit);
  }

  public getEligibleEventsForCampaign(websiteId: string, campaign: Campaign): EventRecord[] {
    const freshnessCutoff = Date.now() - campaign.event_freshness_hours * 3600 * 1000;
    const results: EventRecord[] = [];

    for (const e of this.events.values()) {
      if (
        e.website_id === websiteId &&
        e.is_verified &&
        new Date(e.occurred_at).getTime() >= freshnessCutoff
      ) {
        // Match event types
        if (
          (campaign.notification_type === 'recent_purchase' && e.event_type === 'purchase') ||
          (campaign.notification_type === 'recent_signup' && (e.event_type === 'signup' || e.event_type === 'registration')) ||
          (campaign.notification_type === 'low_stock' && e.event_type === 'inventory_update')
        ) {
          results.push(e);
        }
      }
    }

    return results.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }

  // Telemetry & Analytics
  public recordTelemetry(
    websiteId: string,
    eventType: 'impression' | 'click' | 'dismissal' | 'conversion',
    visitorIdHash: string,
    campaignId?: string,
    eventId?: string,
    pageUrl?: string
  ): void {
    const id = crypto.randomUUID();
    const event: AnalyticsEvent = {
      id,
      website_id: websiteId,
      campaign_id: campaignId || null,
      event_id: eventId || null,
      event_type: eventType,
      page_url: pageUrl || null,
      visitor_id_hash: visitorIdHash,
      created_at: new Date().toISOString()
    };
    this.analyticsEvents.set(id, event);

    const site = this.websites.get(websiteId);
    if (site) {
      site.last_widget_activity_at = new Date().toISOString();
      if (eventType === 'impression') {
        this.incrementImpressionUsage(site.workspace_id);
      }
    }
  }

  public getWebsiteAnalytics(websiteId: string, fromDate?: string, toDate?: string) {
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;

    const fromTime = fromDate ? new Date(fromDate).getTime() : 0;
    const toTime = toDate ? new Date(toDate).getTime() : Infinity;

    for (const a of this.analyticsEvents.values()) {
      if (a.website_id === websiteId) {
        const time = new Date(a.created_at).getTime();
        if (time >= fromTime && time <= toTime) {
          if (a.event_type === 'impression') impressions++;
          if (a.event_type === 'click') clicks++;
          if (a.event_type === 'conversion') conversions++;
        }
      }
    }

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      total_impressions: impressions,
      total_clicks: clicks,
      ctr_percentage: parseFloat(ctr.toFixed(2)),
      attributed_conversions: conversions,
      timeline: [
        {
          date: new Date().toISOString().slice(0, 10),
          impressions,
          clicks,
          conversions
        }
      ]
    };
  }

  // Subscriptions & Quotas
  public getSubscription(workspaceId: string): Subscription | undefined {
    return this.subscriptions.get(workspaceId);
  }

  public updateSubscriptionPlan(workspaceId: string, planTier: PlanTier): Subscription {
    let sub = this.subscriptions.get(workspaceId);
    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        plan_tier: planTier,
        status: 'active',
        provider: 'razorpay',
        provider_subscription_id: `sub_${planTier}_${crypto.randomBytes(4).toString('hex')}`,
        provider_customer_id: null,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      sub.plan_tier = planTier;
      sub.updated_at = new Date().toISOString();
    }
    this.subscriptions.set(workspaceId, sub);
    return sub;
  }

  public getUsageSummary(workspaceId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const counterKey = `${workspaceId}:${currentMonth}`;
    const counter = this.usageCounters.get(counterKey) || {
      id: '',
      workspace_id: workspaceId,
      period_month: currentMonth,
      impression_count: 0,
      event_count: 0,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const sub = this.subscriptions.get(workspaceId);
    const plan = PLAN_CONFIGS[sub?.plan_tier || 'free'];

    const sitesCount = this.listWebsites(workspaceId).length;

    return {
      period_month: currentMonth,
      impressions_used: counter.impression_count,
      impressions_limit: plan.features.impressions_limit_monthly,
      events_used: counter.event_count,
      events_limit: plan.features.impressions_limit_monthly * 2,
      websites_used: sitesCount,
      websites_limit: plan.features.websites_limit,
      plan_tier: plan.id
    };
  }

  private incrementImpressionUsage(workspaceId?: string) {
    if (!workspaceId) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const key = `${workspaceId}:${currentMonth}`;
    const counter = this.usageCounters.get(key) || {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      period_month: currentMonth,
      impression_count: 0,
      event_count: 0,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    counter.impression_count++;
    counter.updated_at = new Date().toISOString();
    this.usageCounters.set(key, counter);
  }

  private incrementEventUsage(workspaceId?: string) {
    if (!workspaceId) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const key = `${workspaceId}:${currentMonth}`;
    const counter = this.usageCounters.get(key) || {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      period_month: currentMonth,
      impression_count: 0,
      event_count: 0,
      last_reset_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    counter.event_count++;
    counter.updated_at = new Date().toISOString();
    this.usageCounters.set(key, counter);
  }

  // Audit Logs
  public logAudit(workspaceId: string, action: string, entityType: string, entityId?: string, actorId?: string, metadata: Record<string, unknown> = {}) {
    this.auditLogs.push({
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      actor_id: actorId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata,
      ip_address: null,
      user_agent: null,
      created_at: new Date().toISOString()
    });
  }
}

export const db = new DataStore();
