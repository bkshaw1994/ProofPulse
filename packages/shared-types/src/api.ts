import {
  UserProfile,
  Workspace,
  Website,
  Campaign,
  EventRecord,
  EventType,
  PlanTier,
  AnalyticsEventType
} from './domain';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  correlation_id: string;
  details?: Array<{ path: string; message: string }>;
}

export interface UserContextResponse {
  user: UserProfile;
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

export interface WebsiteWithCredentials extends Website {
  private_api_key?: string; // Only returned on creation
}

export interface IngestEventRequest {
  website_id?: string;
  event_type: EventType;
  source_event_id: string;
  occurred_at: string;
  payload: {
    first_name: string;
    city?: string;
    item_title?: string;
    item_image_url?: string;
    product_url?: string;
    amount?: number;
    currency?: string;
    quantity?: number;
    items_left?: number;
    [key: string]: unknown;
  };
}

export interface AnalyticsSummaryResponse {
  total_impressions: number;
  total_clicks: number;
  ctr_percentage: number;
  attributed_conversions: number;
  timeline: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface UsageSummaryResponse {
  period_month: string;
  impressions_used: number;
  impressions_limit: number;
  events_used: number;
  events_limit: number;
  websites_used: number;
  websites_limit: number;
  plan_tier: PlanTier;
}

export type AdminIntegrationStatus = 'fully_integrated' | 'widget_only' | 'events_only' | 'not_integrated';

export interface AdminMerchantWebsite {
  id: string;
  domain: string;
  canonical_url: string;
  public_key: string;
  is_verified: boolean;
  verified_at: string | null;
  last_event_at: string | null;
  last_widget_activity_at: string | null;
  created_at: string;
}

export interface AdminMerchantOverview {
  user_id: string;
  email: string;
  full_name: string | null;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  registered_at: string;

  // Integration details
  integration_status: AdminIntegrationStatus;
  widget_installed: boolean;
  webhooks_connected: boolean;
  total_websites: number;
  websites: AdminMerchantWebsite[];
  total_events_ingested: number;
  last_event_at: string | null;
  last_widget_activity_at: string | null;
  active_campaigns_count: number;

  // Membership & Billing details
  plan_tier: PlanTier;
  plan_name: string;
  subscription_status: string;
  is_paying: boolean;
  mrr_inr: number;
  currency: string;
  provider: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  impressions_used: number;
  impressions_limit: number;
  quota_usage_percentage: number;
}

export interface AdminMetricsSummary {
  total_merchants: number;
  total_paying_members: number;
  total_mrr_inr: number;
  paying_conversion_rate: number;
  fully_integrated_merchants: number;
  integration_rate_percentage: number;
  total_active_websites: number;
  total_impressions_served: number;
  total_verified_events: number;
  tier_distribution: Record<PlanTier, number>;
  status_distribution: Record<string, number>;
  integration_distribution: Record<AdminIntegrationStatus, number>;
}

