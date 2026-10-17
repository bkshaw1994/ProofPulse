# ProofPulse Integration Guide

This guide details how e-commerce merchants and developers can integrate **ProofPulse** into Shopify, WooCommerce, or custom storefronts, configure cryptographically verified event webhooks, and ensure compliance with our Zero-Deception policy.

---

## 1. Quick Overview

Integrating ProofPulse requires two decoupled steps:
1. **Public Storefront Widget**: An asynchronous, isolated Shadow DOM script tag (`proofpulse.js`) that displays verified notifications to visitors.
2. **Server-Side Event Ingestion**: An authenticated webhook or REST API pipeline that sends verified purchases, signups, and inventory updates to ProofPulse using private credentials.

```
+-------------------------------------------------------------------------------+
|                            Merchant Storefront                                |
|  Visitors <---> [ Isolated Shadow DOM Widget (<20KB) ]                        |
|                               ^                                               |
|                               | (GET /widget/config, GET /widget/events)      |
+-------------------------------|-----------------------------------------------+
                                |
+-------------------------------+-----------------------------------------------+
|                      ProofPulse Cloud Platform                                |
|  [ Ingestion Pipeline ] <---- [ Verification Gate ] <---- [ Webhook Engine ]  |
+-------------------------------------------------------------------------------+
                                ^
                                | (HMAC-SHA256 Signed Webhook / Private API Key)|
+-------------------------------|-----------------------------------------------+
|                Shopify / WooCommerce / Custom Backend                         |
|  Customer Order Created ---> Webhook Dispatched                              |
+-------------------------------------------------------------------------------+
```

---

## 2. Step 1: Storefront Registration & Credentials

1. Log in to your ProofPulse dashboard at `http://localhost:5173` (or your production URL).
2. Navigate to **Websites & Install** and click **Add New Website**.
3. Enter your canonical domain (e.g., `mystore.in` or `mybrand.myshopify.com`).
4. Save the two generated credentials:
   - **Public Website ID (`public_key`)**: Format `pp_pub_live_...` (Safe to publish in storefront HTML).
   - **Private Ingestion Key (`api_key`)**: Format `pp_sec_live_...` (**Keep secret** - used only on your server or webhook headers).

---

## 3. Step 2: Installing the Storefront Widget

### Option A: Shopify Integration
1. In your Shopify Admin, navigate to **Online Store** -> **Themes**.
2. Click the three dots `...` next to your active theme and select **Edit code**.
3. Under **Layout**, click `theme.liquid`.
4. Locate the closing `</head>` tag (around lines 50–150).
5. Paste the ProofPulse script snippet directly before `</head>`:

```html
<!-- ProofPulse Verified Social Proof Widget -->
<script
  async
  src="https://api.proofpulse.in/widget/proofpulse.js"
  data-website-id="pp_pub_live_YOUR_PUBLIC_KEY"
></script>
<!-- End ProofPulse Widget -->
```
*(For local testing, replace `https://api.proofpulse.in` with `http://localhost:4000`)*.
6. Click **Save**.

### Option B: WooCommerce / WordPress Integration
Add the script to your active child theme's `functions.php`:

```php
<?php
// Add ProofPulse Embed to WooCommerce Storefront Head
add_action('wp_head', function() {
    ?>
    <script 
      async 
      src="https://api.proofpulse.in/widget/proofpulse.js" 
      data-website-id="pp_pub_live_YOUR_PUBLIC_KEY">
    </script>
    <?php
});
```

### Option C: Custom Next.js / React / HTML Storefront
In Next.js (App Router), add the script in `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://api.proofpulse.in/widget/proofpulse.js"
          data-website-id="pp_pub_live_YOUR_PUBLIC_KEY"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. Step 3: Verified Event Ingestion Pipeline

ProofPulse strictly verifies incoming purchase and signup data before displaying notifications.

### Option A: Shopify Automated Webhooks
1. In your Shopify Admin, go to **Settings** -> **Notifications** -> **Webhooks**.
2. Click **Create Webhook**.
3. Configure the following:
   - **Event**: `Order creation` (or `Order payment`).
   - **Format**: `JSON`.
   - **URL**: `https://api.proofpulse.in/api/v1/integrations/shopify/webhook`
   - **Webhook API version**: `Latest (2024-04 or newer)`.
4. ProofPulse validates the `X-Shopify-Hmac-Sha256` header against your configured Shopify App Client Secret.
5. Ingested orders are normalized, stripped of sensitive PII (addresses, phone numbers), and queued for matching campaigns.

---

### Option B: Direct Server-to-Server REST Ingestion
You can ingest verified customer events directly from your backend using our REST endpoint.

- **Endpoint**: `POST https://api.proofpulse.in/api/v1/events`
- **Header**: `X-ProofPulse-Key: pp_sec_live_YOUR_PRIVATE_KEY`
- **Header**: `Content-Type: application/json`

#### cURL Example:
```bash
curl -X POST https://api.proofpulse.in/api/v1/events \
  -H "X-ProofPulse-Key: pp_sec_live_YOUR_PRIVATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "purchase",
    "source_event_id": "order_100482",
    "occurred_at": "2026-10-18T04:00:00Z",
    "payload": {
      "first_name": "Rohan",
      "city": "Mumbai",
      "item_title": "Handcrafted Leather Journal",
      "amount": 1499,
      "quantity": 1,
      "item_image_url": "https://mystore.in/cdn/journal.jpg"
    }
  }'
```

#### Node.js / TypeScript Example:
```typescript
import axios from 'axios';

async function reportVerifiedPurchase(order: { id: string; customerName: string; city: string; title: string; price: number }) {
  await axios.post(
    'https://api.proofpulse.in/api/v1/events',
    {
      event_type: 'purchase',
      source_event_id: String(order.id),
      occurred_at: new Date().toISOString(),
      payload: {
        first_name: order.customerName,
        city: order.city,
        item_title: order.title,
        amount: order.price
      }
    },
    {
      headers: {
        'X-ProofPulse-Key': process.env.PROOFPULSE_PRIVATE_KEY!,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

#### Python Example:
```python
import requests
from datetime import datetime, timezone

def track_purchase(order_id, first_name, city, product_name, amount):
    url = "https://api.proofpulse.in/api/v1/events"
    headers = {
        "X-ProofPulse-Key": "pp_sec_live_YOUR_PRIVATE_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "event_type": "purchase",
        "source_event_id": str(order_id),
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "payload": {
            "first_name": first_name,
            "city": city,
            "item_title": product_name,
            "amount": amount
        }
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
```

---

## 5. Idempotency & Duplicate Prevention

To protect your store metrics from webhook retries (e.g., Shopify sending the same order event multiple times):
- ProofPulse enforces an immutable uniqueness constraint on `(website_id, source, source_event_id)`.
- If a duplicate delivery occurs, ProofPulse responds with `200 OK` and `{ status: "idempotent_duplicate" }`.
- Duplicate notifications are **never** shown to website visitors.

---

## 6. Privacy & DPDP Act Data Minimization

ProofPulse enforces automatic customer pseudonymization:
- **Never Send**: Credit card details, complete street addresses, zip codes, or phone numbers.
- **Allowed Fields**: Customer first name (e.g. `Priya`), city (e.g. `Bengaluru`), purchased item title, and price.
- **Visitor Display**: Formatted strictly as `"Priya in Bengaluru bought Silk Saree"`.

---

## 7. Troubleshooting & Verification Checklist

| Symptom | Root Cause | Solution |
|---|---|---|
| Widget does not appear | Missing `data-website-id` | Confirm `<script data-website-id="pp_pub_live_...">` is present in HTML. |
| Ingestion returns `401 Unauthorized` | Invalid secret key | Verify `X-ProofPulse-Key` matches the private key generated for that website. |
| Notification does not show | Event is older than freshness limit | Campaigns default to 48h freshness. Confirm `occurred_at` timestamp is within the last 48 hours. |
| Webhook returns `401 Invalid HMAC` | Secret mismatch | Ensure the Shopify app client secret matches your ProofPulse integration settings. |
