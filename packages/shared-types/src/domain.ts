export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  user?: UserProfile;
}

export interface Website {
  id: string;
  workspace_id: string;
  domain: string;
  canonical_url: string;
  public_key: string;
  verification_token: string;
  is_verified: boolean;
  verified_at: string | null;
  last_event_at: string | null;
  last_widget_activity_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type IntegrationProvider = 'shopify' | 'woocommerce' | 'custom_webhook' | 'manual_api';
export type IntegrationStatus = 'active' | 'error' | 'disconnected';

export interface IntegrationConnection {
  id: string;
  website_id: string;
  provider: IntegrationProvider;
  external_store_id: string | null;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'recent_purchase'
  | 'recent_signup'
  | 'product_popularity'
  | 'live_visitors'
  | 'low_stock'
  | 'genuine_countdown';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';
export type CampaignPosition = 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right';
export type CampaignTheme = 'light' | 'dark' | 'minimal' | 'glassmorphic';

export interface CampaignPageRules {
  mode: 'all' | 'include' | 'exclude';
  paths: string[];
}

export interface CampaignDeviceTargeting {
  desktop: boolean;
  mobile: boolean;
}

export interface CampaignConfig {
  headline_template?: string;
  cta_url?: string;
  custom_css?: string;
  min_events_threshold?: number;
  countdown_end_time?: string;
  stock_threshold?: number;
}

export interface Campaign {
  id: string;
  website_id: string;
  name: string;
  notification_type: NotificationType;
  status: CampaignStatus;
  priority: number;
  position: CampaignPosition;
  theme: CampaignTheme;
  duration_seconds: number;
  initial_delay_seconds: number;
  display_frequency_minutes: number;
  event_freshness_hours: number;
  page_rules: CampaignPageRules;
  device_targeting: CampaignDeviceTargeting;
  config: CampaignConfig;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export type EventType = 'purchase' | 'signup' | 'registration' | 'inventory_update';
export type EventProcessingStatus = 'pending' | 'processed' | 'filtered_stale' | 'invalid';

export interface NormalizedPurchasePayload {
  first_name: string;
  city?: string;
  item_title: string;
  item_image_url?: string;
  product_url?: string;
  amount_formatted?: string;
  quantity?: number;
}

export interface NormalizedSignupPayload {
  first_name: string;
  city?: string;
  action_label?: string; // e.g., "signed up for webinar"
}

export interface NormalizedInventoryPayload {
  item_title: string;
  item_image_url?: string;
  product_url?: string;
  items_left: number;
}

export type NormalizedEventPayload =
  | NormalizedPurchasePayload
  | NormalizedSignupPayload
  | NormalizedInventoryPayload
  | Record<string, unknown>;

export interface EventRecord {
  id: string;
  website_id: string;
  source: string;
  event_type: EventType;
  source_event_id: string;
  occurred_at: string;
  normalized_payload: NormalizedEventPayload;
  processing_status: EventProcessingStatus;
  is_verified: boolean;
  created_at: string;
}

export type AnalyticsEventType = 'impression' | 'click' | 'dismissal' | 'conversion';

export interface AnalyticsEvent {
  id: string;
  website_id: string;
  campaign_id: string | null;
  event_id: string | null;
  event_type: AnalyticsEventType;
  page_url: string | null;
  visitor_id_hash: string;
  created_at: string;
}

export type PlanTier = 'free' | 'starter' | 'growth' | 'agency';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  workspace_id: string;
  plan_tier: PlanTier;
  status: SubscriptionStatus;
  provider: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageCounter {
  id: string;
  workspace_id: string;
  period_month: string;
  impression_count: number;
  event_count: number;
  last_reset_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
