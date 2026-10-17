import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../app';
import { db } from '../data/store';
import { env } from '../config/env';

describe('ProofPulse API Integration Test Suite', () => {
  const app = createApp();

  it('GET /health - returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('proofpulse-api');
  });

  it('GET /api/v1/me - returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('APPLICATION_ERROR');
  });

  it('GET /api/v1/me - returns user profile and workspace context with test token', async () => {
    const res = await request(app)
      .get('/api/v1/me')
      .set('Authorization', 'Bearer mock_user_00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('demo@proofpulse.in');
    expect(res.body.data.workspaces.length).toBeGreaterThan(0);
  });

  describe('Public Widget Subsystem', () => {
    const testPublicKey = 'pp_pub_live_demo12345';

    it('GET /api/v1/widget/config - returns safe public campaign config', async () => {
      const res = await request(app)
        .get('/api/v1/widget/config')
        .query({ public_key: testPublicKey });

      expect(res.status).toBe(200);
      expect(res.body.campaigns).toBeInstanceOf(Array);
      expect(res.body.is_verified).toBe(true);
    });

    it('GET /api/v1/widget/events - returns eligible notifications', async () => {
      const res = await request(app)
        .get('/api/v1/widget/events')
        .query({ website_id: testPublicKey });

      expect(res.status).toBe(200);
      expect(res.body.notifications).toBeInstanceOf(Array);
      expect(res.body.notifications.length).toBeGreaterThan(0);
      expect(res.body.notifications[0].verified).toBe(true);
    });

    it('POST /api/v1/widget/track - records visitor impression telemetry', async () => {
      const res = await request(app)
        .post('/api/v1/widget/track')
        .send({
          website_id: testPublicKey,
          event_type: 'impression',
          visitor_id_hash: 'visitor_hash_12345678',
          page_url: 'https://demo-store.myshopify.com/products/lamp'
        });

      expect(res.status).toBe(204);
    });
  });

  describe('Event Ingestion Subsystem', () => {
    it('POST /api/v1/events - rejects unauthenticated ingestion', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          event_type: 'purchase',
          source_event_id: 'order_999',
          occurred_at: new Date().toISOString(),
          payload: { first_name: 'Raj', item_title: 'Silk Scarf' }
        });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/events - ingests verified purchase with valid API key', async () => {
      const testApiKey = 'pp_sec_test_secret_key_123';
      const orderId = `test_order_${Date.now()}`;

      const res = await request(app)
        .post('/api/v1/events')
        .set('X-ProofPulse-Key', testApiKey)
        .send({
          event_type: 'purchase',
          source_event_id: orderId,
          occurred_at: new Date().toISOString(),
          payload: {
            first_name: 'Vikram',
            city: 'Delhi',
            item_title: 'Handmade Pashmina Shawl',
            amount: 2499
          }
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.event_id).toBeDefined();

      // Test idempotency: sending identical order returns idempotent_duplicate
      const duplicateRes = await request(app)
        .post('/api/v1/events')
        .set('X-ProofPulse-Key', testApiKey)
        .send({
          event_type: 'purchase',
          source_event_id: orderId,
          occurred_at: new Date().toISOString(),
          payload: {
            first_name: 'Vikram',
            city: 'Delhi',
            item_title: 'Handmade Pashmina Shawl'
          }
        });

      expect(duplicateRes.status).toBe(200);
      expect(duplicateRes.body.status).toBe('idempotent_duplicate');
    });

    it('POST /api/v1/events - rejects malformed payload with 400 and validation issues', async () => {
      const testApiKey = 'pp_sec_test_secret_key_123';
      const res = await request(app)
        .post('/api/v1/events')
        .set('X-ProofPulse-Key', testApiKey)
        .send({
          event_type: 'purchase',
          source_event_id: 'bad_order_01',
          occurred_at: 'not-a-valid-date',
          payload: {}
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
    });
  });

  describe('Shopify Webhook Ingestion with HMAC Verification', () => {
    it('POST /api/v1/integrations/shopify/webhook - rejects invalid HMAC signature with 401', async () => {
      const res = await request(app)
        .post('/api/v1/integrations/shopify/webhook')
        .set('X-Shopify-Hmac-Sha256', 'invalid_signature_string')
        .set('X-Shopify-Shop-Domain', 'demo-store.myshopify.com')
        .send({ id: 1002, total_price: '999.00' });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/integrations/shopify/webhook - accepts valid HMAC signature', async () => {
      const payload = {
        id: 99887766,
        total_price: '1499.00',
        created_at: new Date().toISOString(),
        customer: { first_name: 'Pooja' },
        shipping_address: { city: 'Pune' },
        line_items: [{ title: 'Ceramic Tea Set', quantity: 1 }]
      };

      const payloadString = JSON.stringify(payload);
      const validHmac = crypto
        .createHmac('sha256', env.SHOPIFY_WEBHOOK_SECRET)
        .update(payloadString, 'utf8')
        .digest('base64');

      const res = await request(app)
        .post('/api/v1/integrations/shopify/webhook')
        .set('X-Shopify-Hmac-Sha256', validHmac)
        .set('X-Shopify-Shop-Domain', 'demo-store.myshopify.com')
        .set('Content-Type', 'application/json')
        .send(payloadString);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.event_id).toBeDefined();
    });
  });
});
