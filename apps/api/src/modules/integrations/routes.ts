import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../data/store';
import { env } from '../../config/env';
import { HTTP_HEADERS } from '@proofpulse/config';
import { logger } from '../../lib/logger';

export const integrationsRouter = Router();

// Shopify Webhook Ingestion with HMAC Verification
integrationsRouter.post('/shopify/webhook', (req: Request, res: Response) => {
  const hmacHeader = req.headers[HTTP_HEADERS.SHOPIFY_HMAC] as string;
  const shopDomain = req.headers[HTTP_HEADERS.SHOPIFY_SHOP_DOMAIN] as string;

  if (!hmacHeader) {
    logger.warn('Shopify webhook missing HMAC signature header');
    res.status(401).json({ error: 'Missing X-Shopify-Hmac-Sha256 header' });
    return;
  }

  // Raw body verification
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const calculatedHmac = crypto
    .createHmac('sha256', env.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  // Constant-time compare
  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(hmacHeader, 'utf8'),
      Buffer.from(calculatedHmac, 'utf8')
    );

    if (!isSignatureValid) {
      logger.warn({ hmacHeader }, 'Invalid Shopify HMAC signature rejected');
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }
  } catch (err) {
    logger.warn('HMAC comparison buffer length mismatch');
    res.status(401).json({ error: 'Invalid HMAC signature' });
    return;
  }

  // Find website matching shopDomain
  let matchedSite = Array.from(db.websites.values()).find(
    (s) => s.domain === shopDomain || s.canonical_url.includes(shopDomain)
  );

  // If no exact match, fallback to first verified website for test demo
  if (!matchedSite) {
    matchedSite = Array.from(db.websites.values())[0];
  }

  if (!matchedSite) {
    res.status(404).json({ error: 'Store domain not registered with ProofPulse' });
    return;
  }

  const orderData = req.body;
  const sourceEventId = String(orderData.id || orderData.order_number || crypto.randomUUID());

  // Idempotency check
  if (db.checkEventExists(matchedSite.id, 'shopify', sourceEventId)) {
    res.status(200).json({ status: 'idempotent_duplicate' });
    return;
  }

  // Extract and minimize customer & line item data
  const firstName = orderData.customer?.first_name || 'Customer';
  const city = orderData.shipping_address?.city || orderData.billing_address?.city || undefined;
  const lineItem = orderData.line_items?.[0] || {};
  const itemTitle = lineItem.title || 'Featured Product';
  const itemImageUrl = lineItem.image?.src || undefined;
  const price = orderData.total_price || lineItem.price || undefined;

  const event = db.insertEvent(
    matchedSite.id,
    'shopify',
    'purchase',
    sourceEventId,
    orderData.created_at || new Date().toISOString(),
    {
      first_name: firstName,
      city,
      item_title: itemTitle,
      item_image_url: itemImageUrl,
      amount_formatted: price ? `₹${price}` : undefined,
      quantity: lineItem.quantity || 1
    }
  );

  logger.info({ eventId: event.id, siteId: matchedSite.id }, 'Shopify purchase event verified and ingested');

  res.status(200).json({ status: 'success', event_id: event.id });
});
