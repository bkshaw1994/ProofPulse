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
