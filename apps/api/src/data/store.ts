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
  PlanTier,
  SubscriptionStatus,
  AdminMerchantOverview,
  AdminMetricsSummary,
  AdminIntegrationStatus,
  AdminMerchantWebsite
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
    const currentMonth = new Date().toISOString().slice(0, 7);

    // ==========================================
    // Merchant 1: Patel E-Commerce Group (Growth Tier - Fully Integrated)
    // ==========================================
    const u1 = '00000000-0000-0000-0000-000000000001';
    const ws1 = '10000000-0000-0000-0000-000000000001';
    const site1 = '20000000-0000-0000-0000-000000000001';
    const camp1 = '30000000-0000-0000-0000-000000000001';

    this.profiles.set(u1, {
      id: u1,
      email: 'demo@proofpulse.in',
      full_name: 'Aarav Patel',
      avatar_url: null,
      created_at: '2026-08-10T10:00:00.000Z',
      updated_at: '2026-08-10T10:00:00.000Z'
    });
    this.workspaces.set(ws1, {
      id: ws1,
      name: 'Patel E-Commerce Group',
      slug: 'patel-ecommerce',
      owner_id: u1,
      created_at: '2026-08-10T10:00:00.000Z',
      updated_at: '2026-08-10T10:00:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-001', {
      id: 'member-001',
      workspace_id: ws1,
      user_id: u1,
      role: 'owner',
      created_at: '2026-08-10T10:00:00.000Z'
    });

    const hashedKey1 = this.hashKey('pp_sec_test_secret_key_123');
    this.websites.set(site1, {
      id: site1,
      workspace_id: ws1,
      domain: 'demo-store.myshopify.com',
      canonical_url: 'https://demo-store.myshopify.com',
      public_key: 'pp_pub_live_demo12345',
      verification_token: 'proofpulse-verify-test-token',
      is_verified: true,
      verified_at: '2026-08-11T12:00:00.000Z',
      last_event_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      last_widget_activity_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      created_at: '2026-08-10T10:30:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site1, hashedKey1);
    this.rawApiKeys.set(hashedKey1, site1);

    this.campaigns.set(camp1, {
      id: camp1,
      website_id: site1,
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
      created_at: '2026-08-11T12:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    const ev1 = '40000000-0000-0000-0000-000000000001';
    this.events.set(ev1, {
      id: ev1,
      website_id: site1,
      source: 'shopify',
      event_type: 'purchase',
      source_event_id: 'shopify_order_1001',
      occurred_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
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

    this.subscriptions.set(ws1, {
      id: 'sub-001',
      workspace_id: ws1,
      plan_tier: 'growth',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: 'sub_patel_growth_8471',
      provider_customer_id: 'cust_patel_9921',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 12,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 18,
      cancel_at_period_end: false,
      created_at: '2026-08-10T10:05:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws1}:${currentMonth}`, {
      id: `usage-${ws1}-${currentMonth}`,
      workspace_id: ws1,
      period_month: currentMonth,
      impression_count: 34250,
      event_count: 412,
      last_reset_at: '2026-10-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    // ==========================================
    // Merchant 2: Bombay Artisan Crafts (Agency Tier - Fully Integrated, 2 Stores)
    // ==========================================
    const u2 = '00000000-0000-0000-0000-000000000002';
    const ws2 = '10000000-0000-0000-0000-000000000002';
    const site2a = '20000000-0000-0000-0000-000000000002';
    const site2b = '20000000-0000-0000-0000-000000000003';

    this.profiles.set(u2, {
      id: u2,
      email: 'priya@bombaycrafts.in',
      full_name: 'Priya Sharma',
      avatar_url: null,
      created_at: '2026-07-15T09:00:00.000Z',
      updated_at: '2026-07-15T09:00:00.000Z'
    });
    this.workspaces.set(ws2, {
      id: ws2,
      name: 'Bombay Artisan Living Pvt Ltd',
      slug: 'bombay-artisan-crafts',
      owner_id: u2,
      created_at: '2026-07-15T09:00:00.000Z',
      updated_at: '2026-07-15T09:00:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-002', {
      id: 'member-002',
      workspace_id: ws2,
      user_id: u2,
      role: 'owner',
      created_at: '2026-07-15T09:00:00.000Z'
    });

    const key2a = this.hashKey('pp_sec_bombay_crafts_secret');
    this.websites.set(site2a, {
      id: site2a,
      workspace_id: ws2,
      domain: 'bombaycrafts.in',
      canonical_url: 'https://bombaycrafts.in',
      public_key: 'pp_pub_live_bombaycrafts',
      verification_token: 'proofpulse-verify-bombay',
      is_verified: true,
      verified_at: '2026-07-16T10:00:00.000Z',
      last_event_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      last_widget_activity_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      created_at: '2026-07-15T09:30:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site2a, key2a);
    this.rawApiKeys.set(key2a, site2a);

    const key2b = this.hashKey('pp_sec_luxe_homeware_secret');
    this.websites.set(site2b, {
      id: site2b,
      workspace_id: ws2,
      domain: 'luxe-homeware.in',
      canonical_url: 'https://luxe-homeware.in',
      public_key: 'pp_pub_live_luxehomeware',
      verification_token: 'proofpulse-verify-luxe',
      is_verified: true,
      verified_at: '2026-08-01T14:00:00.000Z',
      last_event_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      last_widget_activity_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      created_at: '2026-08-01T12:00:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site2b, key2b);
    this.rawApiKeys.set(key2b, site2b);

    this.subscriptions.set(ws2, {
      id: 'sub-002',
      workspace_id: ws2,
      plan_tier: 'agency',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: 'sub_bombay_agency_1092',
      provider_customer_id: 'cust_priya_sharma_029',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 20,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 10,
      cancel_at_period_end: false,
      created_at: '2026-07-15T09:15:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws2}:${currentMonth}`, {
      id: `usage-${ws2}-${currentMonth}`,
      workspace_id: ws2,
      period_month: currentMonth,
      impression_count: 184500,
      event_count: 1620,
      last_reset_at: '2026-10-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    // Seed events for Bombay Artisan
    const ev2 = '40000000-0000-0000-0000-000000000002';
    this.events.set(ev2, {
      id: ev2,
      website_id: site2a,
      source: 'woocommerce',
      event_type: 'purchase',
      source_event_id: 'wc_order_8829',
      occurred_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      normalized_payload: {
        first_name: 'Rajesh',
        city: 'Bengaluru',
        item_title: 'Hand-woven Ikat Bedspread',
        item_image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=150',
        amount_formatted: '₹3,450',
        quantity: 1
      },
      processing_status: 'processed',
      is_verified: true,
      created_at: new Date().toISOString()
    });

    // ==========================================
    // Merchant 3: Kerala Spices Direct (Starter Tier - Widget Installed, Webhook Pending)
    // ==========================================
    const u3 = '00000000-0000-0000-0000-000000000003';
    const ws3 = '10000000-0000-0000-0000-000000000003';
    const site3 = '20000000-0000-0000-0000-000000000004';

    this.profiles.set(u3, {
      id: u3,
      email: 'rohit@keralaspices.co',
      full_name: 'Rohit Menon',
      avatar_url: null,
      created_at: '2026-09-02T11:20:00.000Z',
      updated_at: '2026-09-02T11:20:00.000Z'
    });
    this.workspaces.set(ws3, {
      id: ws3,
      name: 'Kerala Spices Direct Organic',
      slug: 'kerala-spices-direct',
      owner_id: u3,
      created_at: '2026-09-02T11:20:00.000Z',
      updated_at: '2026-09-02T11:20:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-003', {
      id: 'member-003',
      workspace_id: ws3,
      user_id: u3,
      role: 'owner',
      created_at: '2026-09-02T11:20:00.000Z'
    });

    const key3 = this.hashKey('pp_sec_kerala_spices_secret');
    this.websites.set(site3, {
      id: site3,
      workspace_id: ws3,
      domain: 'keralaspices.co',
      canonical_url: 'https://keralaspices.co',
      public_key: 'pp_pub_live_keralaspices',
      verification_token: 'proofpulse-verify-kerala',
      is_verified: true,
      verified_at: '2026-09-03T09:00:00.000Z',
      last_event_at: null, // No webhooks connected yet!
      last_widget_activity_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      created_at: '2026-09-02T11:45:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site3, key3);
    this.rawApiKeys.set(key3, site3);

    this.subscriptions.set(ws3, {
      id: 'sub-003',
      workspace_id: ws3,
      plan_tier: 'starter',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: 'sub_kerala_starter_5532',
      provider_customer_id: 'cust_rohit_menon_194',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 8,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 22,
      cancel_at_period_end: false,
      created_at: '2026-09-02T11:30:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws3}:${currentMonth}`, {
      id: `usage-${ws3}-${currentMonth}`,
      workspace_id: ws3,
      period_month: currentMonth,
      impression_count: 5210,
      event_count: 0,
      last_reset_at: '2026-10-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    // ==========================================
    // Merchant 4: Delhi Streetwear Hub (Starter Tier - Past Due, Webhooks Only)
    // ==========================================
    const u4 = '00000000-0000-0000-0000-000000000004';
    const ws4 = '10000000-0000-0000-0000-000000000004';
    const site4 = '20000000-0000-0000-0000-000000000005';

    this.profiles.set(u4, {
      id: u4,
      email: 'vikram@delhistreetwear.com',
      full_name: 'Vikram Malhotra',
      avatar_url: null,
      created_at: '2026-08-25T15:00:00.000Z',
      updated_at: '2026-08-25T15:00:00.000Z'
    });
    this.workspaces.set(ws4, {
      id: ws4,
      name: 'Delhi Streetwear Apparel',
      slug: 'delhi-streetwear',
      owner_id: u4,
      created_at: '2026-08-25T15:00:00.000Z',
      updated_at: '2026-08-25T15:00:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-004', {
      id: 'member-004',
      workspace_id: ws4,
      user_id: u4,
      role: 'owner',
      created_at: '2026-08-25T15:00:00.000Z'
    });

    const key4 = this.hashKey('pp_sec_delhi_streetwear_secret');
    this.websites.set(site4, {
      id: site4,
      workspace_id: ws4,
      domain: 'delhistreetwear.com',
      canonical_url: 'https://delhistreetwear.com',
      public_key: 'pp_pub_live_delhistreetwear',
      verification_token: 'proofpulse-verify-delhi',
      is_verified: true,
      verified_at: '2026-08-26T10:00:00.000Z',
      last_event_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      last_widget_activity_at: null, // Widget snippet not pinging!
      created_at: '2026-08-25T15:30:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site4, key4);
    this.rawApiKeys.set(key4, site4);

    const ev4 = '40000000-0000-0000-0000-000000000004';
    this.events.set(ev4, {
      id: ev4,
      website_id: site4,
      source: 'custom_webhook',
      event_type: 'purchase',
      source_event_id: 'ord_delhi_883',
      occurred_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      normalized_payload: {
        first_name: 'Sameer',
        city: 'New Delhi',
        item_title: 'Oversized Acid-Wash Hoodie',
        item_image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150',
        amount_formatted: '₹2,199',
        quantity: 1
      },
      processing_status: 'processed',
      is_verified: true,
      created_at: new Date().toISOString()
    });

    this.subscriptions.set(ws4, {
      id: 'sub-004',
      workspace_id: ws4,
      plan_tier: 'starter',
      status: 'past_due',
      provider: 'razorpay',
      provider_subscription_id: 'sub_delhi_starter_7718',
      provider_customer_id: 'cust_vikram_malhotra_993',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 32,
      current_period_end: Math.floor(Date.now() / 1000) - 86400 * 2,
      cancel_at_period_end: false,
      created_at: '2026-08-25T15:10:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws4}:${currentMonth}`, {
      id: `usage-${ws4}-${currentMonth}`,
      workspace_id: ws4,
      period_month: currentMonth,
      impression_count: 0,
      event_count: 98,
      last_reset_at: '2026-10-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    // ==========================================
    // Merchant 5: Jaipur Jewels Online (Free Tier - Not Integrated)
    // ==========================================
    const u5 = '00000000-0000-0000-0000-000000000005';
    const ws5 = '10000000-0000-0000-0000-000000000005';
    const site5 = '20000000-0000-0000-0000-000000000006';

    this.profiles.set(u5, {
      id: u5,
      email: 'neha@jaipurjewels.store',
      full_name: 'Neha Singhania',
      avatar_url: null,
      created_at: '2026-10-18T14:00:00.000Z',
      updated_at: '2026-10-18T14:00:00.000Z'
    });
    this.workspaces.set(ws5, {
      id: ws5,
      name: 'Jaipur Jewels Fine Craft',
      slug: 'jaipur-jewels-store',
      owner_id: u5,
      created_at: '2026-10-18T14:00:00.000Z',
      updated_at: '2026-10-18T14:00:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-005', {
      id: 'member-005',
      workspace_id: ws5,
      user_id: u5,
      role: 'owner',
      created_at: '2026-10-18T14:00:00.000Z'
    });

    const key5 = this.hashKey('pp_sec_jaipur_jewels_secret');
    this.websites.set(site5, {
      id: site5,
      workspace_id: ws5,
      domain: 'jaipurjewels.store',
      canonical_url: 'https://jaipurjewels.store',
      public_key: 'pp_pub_live_jaipurjewels',
      verification_token: 'proofpulse-verify-jaipur',
      is_verified: false,
      verified_at: null,
      last_event_at: null,
      last_widget_activity_at: null,
      created_at: '2026-10-18T14:15:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site5, key5);
    this.rawApiKeys.set(key5, site5);

    this.subscriptions.set(ws5, {
      id: 'sub-005',
      workspace_id: ws5,
      plan_tier: 'free',
      status: 'active',
      provider: 'none',
      provider_subscription_id: null,
      provider_customer_id: null,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: null,
      cancel_at_period_end: false,
      created_at: '2026-10-18T14:05:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws5}:${currentMonth}`, {
      id: `usage-${ws5}-${currentMonth}`,
      workspace_id: ws5,
      period_month: currentMonth,
      impression_count: 0,
      event_count: 0,
      last_reset_at: '2026-10-01T00:00:00.000Z',
      updated_at: new Date().toISOString()
    });

    // ==========================================
    // Merchant 6: Bangalore Tech Gear (Growth Tier - Fully Integrated)
    // ==========================================
    const u6 = '00000000-0000-0000-0000-000000000006';
    const ws6 = '10000000-0000-0000-0000-000000000006';
    const site6 = '20000000-0000-0000-0000-000000000007';

    this.profiles.set(u6, {
      id: u6,
      email: 'kiran@techgear.io',
      full_name: 'Kiran Rao',
      avatar_url: null,
      created_at: '2026-09-12T08:00:00.000Z',
      updated_at: '2026-09-12T08:00:00.000Z'
    });
    this.workspaces.set(ws6, {
      id: ws6,
      name: 'TechGear India Direct',
      slug: 'techgear-india',
      owner_id: u6,
      created_at: '2026-09-12T08:00:00.000Z',
      updated_at: '2026-09-12T08:00:00.000Z',
      deleted_at: null
    });
    this.workspaceMembers.set('member-006', {
      id: 'member-006',
      workspace_id: ws6,
      user_id: u6,
      role: 'owner',
      created_at: '2026-09-12T08:00:00.000Z'
    });

    const key6 = this.hashKey('pp_sec_techgear_secret');
    this.websites.set(site6, {
      id: site6,
      workspace_id: ws6,
      domain: 'techgear.io',
      canonical_url: 'https://techgear.io',
      public_key: 'pp_pub_live_techgear',
      verification_token: 'proofpulse-verify-techgear',
      is_verified: true,
      verified_at: '2026-09-13T11:00:00.000Z',
      last_event_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      last_widget_activity_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      created_at: '2026-09-12T08:30:00.000Z',
      updated_at: new Date().toISOString(),
      deleted_at: null
    });
    this.websiteApiKeys.set(site6, key6);
    this.rawApiKeys.set(key6, site6);

    const ev6 = '40000000-0000-0000-0000-000000000006';
    this.events.set(ev6, {
      id: ev6,
      website_id: site6,
      source: 'shopify',
      event_type: 'purchase',
      source_event_id: 'shopify_order_9901',
      occurred_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      normalized_payload: {
        first_name: 'Tanvi',
        city: 'Hyderabad',
        item_title: 'Ergonomic Mechanical Keyboard',
        item_image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150',
        amount_formatted: '₹5,499',
        quantity: 1
      },
      processing_status: 'processed',
      is_verified: true,
      created_at: new Date().toISOString()
    });

    this.subscriptions.set(ws6, {
      id: 'sub-006',
      workspace_id: ws6,
      plan_tier: 'growth',
      status: 'active',
      provider: 'razorpay',
      provider_subscription_id: 'sub_techgear_growth_3391',
      provider_customer_id: 'cust_kiran_rao_552',
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 10,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 20,
      cancel_at_period_end: false,
      created_at: '2026-09-12T08:15:00.000Z',
      updated_at: new Date().toISOString()
    });

    this.usageCounters.set(`${ws6}:${currentMonth}`, {
      id: `usage-${ws6}-${currentMonth}`,
      workspace_id: ws6,
      period_month: currentMonth,
      impression_count: 58900,
      event_count: 630,
      last_reset_at: '2026-10-01T00:00:00.000Z',
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

  public getWorkspace(id: string): Workspace | undefined {
    const ws = this.workspaces.get(id);
    return ws && !ws.deleted_at ? ws : undefined;
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
  public logAudit(
    workspaceId: string,
    action: string,
    entityType: string,
    entityId?: string,
    actorId?: string,
    metadata: Record<string, unknown> = {}
  ): void {
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

  // ==========================================
  // Internal Admin & Operations Subsystem
  // ==========================================
  public getAdminMerchantsList(filter?: {
    search?: string;
    integration_status?: string;
    plan_tier?: string;
    subscription_status?: string;
  }): AdminMerchantOverview[] {
    const list: AdminMerchantOverview[] = [];

    for (const ws of this.workspaces.values()) {
      if (ws.deleted_at) continue;

      // Find primary owner
      let ownerProfile: UserProfile | undefined;
      for (const m of this.workspaceMembers.values()) {
        if (m.workspace_id === ws.id) {
          const profile = this.profiles.get(m.user_id);
          if (profile) {
            ownerProfile = profile;
            if (m.role === 'owner') break;
          }
        }
      }

      if (!ownerProfile) {
        ownerProfile = {
          id: 'unknown-user',
          email: `${ws.slug}@merchant.proofpulse.in`,
          full_name: ws.name,
          avatar_url: null,
          created_at: ws.created_at,
          updated_at: ws.updated_at
        };
      }

      // Websites
      const sites = this.listWebsites(ws.id);
      const merchantWebsites: AdminMerchantWebsite[] = sites.map((s) => ({
        id: s.id,
        domain: s.domain,
        canonical_url: s.canonical_url,
        public_key: s.public_key,
        is_verified: s.is_verified,
        verified_at: s.verified_at,
        last_event_at: s.last_event_at,
        last_widget_activity_at: s.last_widget_activity_at,
        created_at: s.created_at
      }));

      // Ingested events count
      const siteIds = new Set(sites.map((s) => s.id));
      let totalEvents = 0;
      let lastEventTime: string | null = null;
      let lastWidgetTime: string | null = null;
      let totalCampaigns = 0;

      for (const s of sites) {
        if (s.last_event_at) {
          if (!lastEventTime || new Date(s.last_event_at) > new Date(lastEventTime)) {
            lastEventTime = s.last_event_at;
          }
        }
        if (s.last_widget_activity_at) {
          if (!lastWidgetTime || new Date(s.last_widget_activity_at) > new Date(lastWidgetTime)) {
            lastWidgetTime = s.last_widget_activity_at;
          }
        }
        totalCampaigns += this.listCampaigns(s.id).length;
      }

      for (const ev of this.events.values()) {
        if (siteIds.has(ev.website_id)) {
          totalEvents++;
          if (!lastEventTime || new Date(ev.occurred_at) > new Date(lastEventTime)) {
            lastEventTime = ev.occurred_at;
          }
        }
      }

      // Determine integration status
      const hasWidget = !!lastWidgetTime || sites.some((s) => !!s.last_widget_activity_at);
      const hasEvents = totalEvents > 0 || !!lastEventTime || sites.some((s) => !!s.last_event_at);

      let integration_status: AdminIntegrationStatus = 'not_integrated';
      if (hasWidget && hasEvents) {
        integration_status = 'fully_integrated';
      } else if (hasWidget && !hasEvents) {
        integration_status = 'widget_only';
      } else if (!hasWidget && hasEvents) {
        integration_status = 'events_only';
      } else {
        integration_status = 'not_integrated';
      }

      // Subscription & Usage
      const sub = this.subscriptions.get(ws.id);
      const planTier: PlanTier = sub?.plan_tier || 'free';
      const planConfig = PLAN_CONFIGS[planTier];
      const subStatus = sub?.status || 'active';
      const isPaying = planTier !== 'free' && subStatus === 'active';
      const mrrInr = isPaying ? planConfig.price_inr : 0;

      const usage = this.getUsageSummary(ws.id);
      const quotaPct = usage.impressions_limit > 0
        ? Math.min(100, Math.round((usage.impressions_used / usage.impressions_limit) * 100))
        : 0;

      const merchant: AdminMerchantOverview = {
        user_id: ownerProfile.id,
        email: ownerProfile.email,
        full_name: ownerProfile.full_name,
        workspace_id: ws.id,
        workspace_name: ws.name,
        workspace_slug: ws.slug,
        registered_at: ws.created_at,

        integration_status,
        widget_installed: hasWidget,
        webhooks_connected: hasEvents,
        total_websites: sites.length,
        websites: merchantWebsites,
        total_events_ingested: totalEvents,
        last_event_at: lastEventTime,
        last_widget_activity_at: lastWidgetTime,
        active_campaigns_count: totalCampaigns,

        plan_tier: planTier,
        plan_name: planConfig.name,
        subscription_status: subStatus,
        is_paying: isPaying,
        mrr_inr: mrrInr,
        currency: 'INR',
        provider: sub?.provider || 'razorpay',
        provider_subscription_id: sub?.provider_subscription_id || null,
        provider_customer_id: sub?.provider_customer_id || null,
        current_period_start: sub?.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
        current_period_end: sub?.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: !!sub?.cancel_at_period_end,
        impressions_used: usage.impressions_used,
        impressions_limit: usage.impressions_limit,
        quota_usage_percentage: quotaPct
      };

      // Apply Filters
      if (filter) {
        if (filter.search) {
          const q = filter.search.toLowerCase();
          const matchName = merchant.full_name?.toLowerCase().includes(q);
          const matchEmail = merchant.email.toLowerCase().includes(q);
          const matchWs = merchant.workspace_name.toLowerCase().includes(q);
          const matchDomain = merchant.websites.some((s) => s.domain.toLowerCase().includes(q));
          const matchSubId = merchant.provider_subscription_id?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchWs && !matchDomain && !matchSubId) {
            continue;
          }
        }
        if (filter.integration_status && filter.integration_status !== 'all') {
          if (merchant.integration_status !== filter.integration_status) {
            continue;
          }
        }
        if (filter.plan_tier && filter.plan_tier !== 'all') {
          if (merchant.plan_tier !== filter.plan_tier) {
            continue;
          }
        }
        if (filter.subscription_status && filter.subscription_status !== 'all') {
          if (merchant.subscription_status !== filter.subscription_status) {
            continue;
          }
        }
      }

      list.push(merchant);
    }

    return list;
  }

  public getAdminMetricsSummary(): AdminMetricsSummary {
    const merchants = this.getAdminMerchantsList();

    const totalMerchants = merchants.length;
    let totalPaying = 0;
    let totalMrr = 0;
    let fullyIntegrated = 0;
    let totalActiveWebsites = 0;
    let totalImpressions = 0;
    let totalEvents = 0;

    const tierDist: Record<PlanTier, number> = {
      free: 0,
      starter: 0,
      growth: 0,
      agency: 0
    };

    const statusDist: Record<string, number> = {
      active: 0,
      past_due: 0,
      canceled: 0,
      trialing: 0
    };

    const integrationDist: Record<AdminIntegrationStatus, number> = {
      fully_integrated: 0,
      widget_only: 0,
      events_only: 0,
      not_integrated: 0
    };

    for (const m of merchants) {
      if (m.is_paying) totalPaying++;
      totalMrr += m.mrr_inr;
      if (m.integration_status === 'fully_integrated') fullyIntegrated++;
      totalActiveWebsites += m.websites.filter((w) => w.is_verified).length;
      totalImpressions += m.impressions_used;
      totalEvents += m.total_events_ingested;

      if (tierDist[m.plan_tier] !== undefined) tierDist[m.plan_tier]++;
      if (statusDist[m.subscription_status] !== undefined) statusDist[m.subscription_status]++;
      else statusDist[m.subscription_status] = (statusDist[m.subscription_status] || 0) + 1;

      if (integrationDist[m.integration_status] !== undefined) integrationDist[m.integration_status]++;
    }

    const conversionRate = totalMerchants > 0 ? parseFloat(((totalPaying / totalMerchants) * 100).toFixed(1)) : 0;
    const integrationRate = totalMerchants > 0 ? parseFloat(((fullyIntegrated / totalMerchants) * 100).toFixed(1)) : 0;

    return {
      total_merchants: totalMerchants,
      total_paying_members: totalPaying,
      total_mrr_inr: totalMrr,
      paying_conversion_rate: conversionRate,
      fully_integrated_merchants: fullyIntegrated,
      integration_rate_percentage: integrationRate,
      total_active_websites: totalActiveWebsites,
      total_impressions_served: totalImpressions,
      total_verified_events: totalEvents,
      tier_distribution: tierDist,
      status_distribution: statusDist,
      integration_distribution: integrationDist
    };
  }

  public adminUpdateSubscription(
    workspaceId: string,
    planTier: PlanTier,
    status: SubscriptionStatus = 'active',
    reason: string = 'Staff manual override'
  ): Subscription {
    let sub = this.subscriptions.get(workspaceId);
    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        workspace_id: workspaceId,
        plan_tier: planTier,
        status,
        provider: 'manual_override',
        provider_subscription_id: `sub_admin_override_${crypto.randomBytes(4).toString('hex')}`,
        provider_customer_id: 'cust_internal_staff',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 365,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      sub.plan_tier = planTier;
      sub.status = status;
      sub.updated_at = new Date().toISOString();
    }
    this.subscriptions.set(workspaceId, sub);

    this.logAudit(
      workspaceId,
      'admin.update_subscription',
      'subscription',
      sub.id,
      'internal_operator',
      { plan_tier: planTier, status, reason }
    );

    return sub;
  }
}

export const db = new DataStore();

