import { Router, Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { db } from '../../data/store';
import { TrackTelemetrySchema } from '@proofpulse/validation';
import { PublicNotificationItem, PublicWidgetConfig } from '@proofpulse/shared-types';

export const widgetRouter = Router();

// Helper to format relative time (e.g., "12 minutes ago")
function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Fetch safe public widget configuration
widgetRouter.get('/config', (req: Request, res: Response) => {
  const websiteIdentifier = (req.query.website_id as string) || (req.query.public_key as string);
  if (!websiteIdentifier) {
    throw new AppError('website_id query parameter is required.', 400);
  }

  // Find website by UUID or public_key
  let site = db.getWebsiteById(websiteIdentifier);
  if (!site) {
    site = db.getWebsiteByPublicKey(websiteIdentifier);
  }

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const activeCampaigns = db.listCampaigns(site.id).filter((c) => c.status === 'active');

  const config: PublicWidgetConfig = {
    website_id: site.id,
    is_verified: site.is_verified,
    campaigns: activeCampaigns.map((c) => ({
      id: c.id,
      notification_type: c.notification_type,
      position: c.position,
      theme: c.theme,
      duration_seconds: c.duration_seconds,
      initial_delay_seconds: c.initial_delay_seconds,
      display_frequency_minutes: c.display_frequency_minutes,
      page_rules: c.page_rules,
      device_targeting: c.device_targeting,
      config: {
        headline_template: c.config.headline_template,
        cta_url: c.config.cta_url,
        countdown_end_time: c.config.countdown_end_time || (c.end_time || undefined),
        stock_threshold: c.config.stock_threshold
      }
    }))
  };

  res.status(200).json(config);
});

// Fetch eligible notifications for public display
widgetRouter.get('/events', (req: Request, res: Response) => {
  const websiteIdentifier = req.query.website_id as string;
  if (!websiteIdentifier) {
    throw new AppError('website_id query parameter is required.', 400);
  }

  let site = db.getWebsiteById(websiteIdentifier);
  if (!site) {
    site = db.getWebsiteByPublicKey(websiteIdentifier);
  }

  if (!site) {
    throw new AppError('Website not found.', 404);
  }

  const activeCampaigns = db.listCampaigns(site.id).filter((c) => c.status === 'active');
  const notifications: PublicNotificationItem[] = [];

  for (const campaign of activeCampaigns) {
    if (campaign.notification_type === 'genuine_countdown') {
      const deadline = campaign.config.countdown_end_time || campaign.end_time;
      if (deadline && new Date(deadline).getTime() > Date.now()) {
        notifications.push({
          id: `countdown-${campaign.id}`,
          campaign_id: campaign.id,
          notification_type: 'genuine_countdown',
          title: campaign.name,
          message: campaign.config.headline_template || 'Special offer ends soon!',
          timestamp_formatted: 'Ends soon',
          verified: true,
          meta: {
            countdown_deadline: deadline
          }
        });
      }
      continue;
    }

    if (campaign.notification_type === 'live_visitors') {
      // Measurable count based on active telemetry in last 5 minutes
      const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
      let activeVisitors = 0;
      const seen = new Set<string>();
      for (const a of db.analyticsEvents.values()) {
        if (a.website_id === site.id && new Date(a.created_at).getTime() >= fiveMinsAgo) {
          if (!seen.has(a.visitor_id_hash)) {
            seen.add(a.visitor_id_hash);
            activeVisitors++;
          }
        }
      }

      // If active visitors threshold is met, display genuine count
      const minThreshold = campaign.config.min_events_threshold || 1;
      if (activeVisitors >= minThreshold) {
        notifications.push({
          id: `visitors-${campaign.id}`,
          campaign_id: campaign.id,
          notification_type: 'live_visitors',
          title: `${activeVisitors} people viewing right now`,
          message: 'Real-time verified store activity',
          timestamp_formatted: 'Live',
          verified: true,
          meta: {
            visitor_count: activeVisitors
          }
        });
      }
      continue;
    }

    // For purchases, signups, inventory: fetch eligible verified events
    const eligibleEvents = db.getEligibleEventsForCampaign(site.id, campaign);
    for (const event of eligibleEvents.slice(0, 5)) {
      const p = event.normalized_payload as any;
      let title = '';
      let message = '';

      if (event.event_type === 'purchase') {
        title = p.city ? `${p.first_name} in ${p.city}` : p.first_name;
        message = `Purchased ${p.item_title}`;
      } else if (event.event_type === 'signup' || event.event_type === 'registration') {
        title = p.city ? `${p.first_name} in ${p.city}` : p.first_name;
        message = p.action_label || 'Joined the community';
      } else if (event.event_type === 'inventory_update') {
        title = `Only ${p.items_left} left in stock!`;
        message = `${p.item_title} is selling fast`;
      }

      notifications.push({
        id: event.id,
        campaign_id: campaign.id,
        notification_type: campaign.notification_type,
        title,
        message,
        image_url: p.item_image_url,
        target_url: p.product_url,
        timestamp_formatted: formatRelativeTime(event.occurred_at),
        verified: true,
        meta: {
          items_left: p.items_left
        }
      });
    }
  }

  res.status(200).json({ notifications });
});

// Telemetry recording endpoint
widgetRouter.post('/track', (req: Request, res: Response) => {
  const validated = TrackTelemetrySchema.parse(req.body);

  let site = db.getWebsiteById(validated.website_id);
  if (!site) {
    site = db.getWebsiteByPublicKey(validated.website_id);
  }

  if (site) {
    db.recordTelemetry(
      site.id,
      validated.event_type,
      validated.visitor_id_hash,
      validated.campaign_id,
      validated.event_id,
      validated.page_url
    );
  }

  res.status(204).send();
});
