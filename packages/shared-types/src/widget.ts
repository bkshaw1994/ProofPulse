import { Campaign, CampaignPosition, CampaignTheme, NotificationType } from './domain';

export interface PublicWidgetConfig {
  website_id: string;
  is_verified: boolean;
  campaigns: PublicWidgetCampaign[];
}

export interface PublicWidgetCampaign {
  id: string;
  notification_type: NotificationType;
  position: CampaignPosition;
  theme: CampaignTheme;
  duration_seconds: number;
  initial_delay_seconds: number;
  display_frequency_minutes: number;
  page_rules: {
    mode: 'all' | 'include' | 'exclude';
    paths: string[];
  };
  device_targeting: {
    desktop: boolean;
    mobile: boolean;
  };
  config: {
    headline_template?: string;
    cta_url?: string;
    countdown_end_time?: string;
    stock_threshold?: number;
  };
}

export interface PublicNotificationItem {
  id: string;
  campaign_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  image_url?: string;
  target_url?: string;
  timestamp_formatted: string;
  verified: boolean;
  meta?: {
    items_left?: number;
    countdown_deadline?: string;
    visitor_count?: number;
  };
}

export interface WidgetTelemetryPayload {
  website_id: string;
  campaign_id?: string;
  event_id?: string;
  event_type: 'impression' | 'click' | 'dismissal';
  visitor_id_hash: string;
  page_url?: string;
}
