import { PlanTier } from '@proofpulse/shared-types';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price_inr: number;
  price_formatted: string;
  billing_interval: 'month';
  description: string;
  features: {
    websites_limit: number;
    impressions_limit_monthly: number;
    event_freshness_hours: number;
    custom_branding: boolean;
    priority_support: boolean;
    analytics_history_days: number;
    max_active_campaigns_per_site: number;
  };
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    price_inr: 0,
    price_formatted: '₹0',
    billing_interval: 'month',
    description: 'Perfect for new e-commerce stores testing social proof.',
    features: {
      websites_limit: 1,
      impressions_limit_monthly: 2000,
      event_freshness_hours: 48,
      custom_branding: false,
      priority_support: false,
      analytics_history_days: 7,
      max_active_campaigns_per_site: 2
    }
  },
  starter: {
    id: 'starter',
    name: 'Growth Starter',
    price_inr: 499,
    price_formatted: '₹499',
    billing_interval: 'month',
    description: 'For growing stores aiming to double conversion rates.',
    features: {
      websites_limit: 2,
      impressions_limit_monthly: 20000,
      event_freshness_hours: 72,
      custom_branding: true,
      priority_support: false,
      analytics_history_days: 30,
      max_active_campaigns_per_site: 5
    }
  },
  growth: {
    id: 'growth',
    name: 'Business Pro',
    price_inr: 1499,
    price_formatted: '₹1,499',
    billing_interval: 'month',
    description: 'High-volume merchants wanting multi-store agility & deep insights.',
    features: {
      websites_limit: 5,
      impressions_limit_monthly: 100000,
      event_freshness_hours: 168, // 7 days
      custom_branding: true,
      priority_support: true,
      analytics_history_days: 90,
      max_active_campaigns_per_site: 20
    }
  },
  agency: {
    id: 'agency',
    name: 'Agency Scale',
    price_inr: 3999,
    price_formatted: '₹3,999',
    billing_interval: 'month',
    description: 'Full multi-tenant white-label power for e-commerce agencies.',
    features: {
      websites_limit: 20,
      impressions_limit_monthly: 500000,
      event_freshness_hours: 720, // 30 days
      custom_branding: true,
      priority_support: true,
      analytics_history_days: 365,
      max_active_campaigns_per_site: 100
    }
  }
};
