export const APP_NAME = 'ProofPulse';
export const DEFAULT_CAMPAIGN_DURATION_SECONDS = 6;
export const DEFAULT_CAMPAIGN_INITIAL_DELAY_SECONDS = 3;
export const DEFAULT_CAMPAIGN_DISPLAY_FREQUENCY_MINUTES = 5;
export const DEFAULT_EVENT_FRESHNESS_HOURS = 48;

export const HTTP_HEADERS = {
  CORRELATION_ID: 'x-correlation-id',
  API_KEY: 'x-proofpulse-key',
  SHOPIFY_HMAC: 'x-shopify-hmac-sha256',
  SHOPIFY_SHOP_DOMAIN: 'x-shopify-shop-domain',
  RAZORPAY_SIGNATURE: 'x-razorpay-signature'
} as const;

export const DEFAULT_PAGINATION_LIMIT = 50;
export const MAX_PAGINATION_LIMIT = 100;
