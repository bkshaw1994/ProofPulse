import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Globe,
  Terminal,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shopify' | 'woo' | 'nextjs' | 'curl' | 'nodejs'>('shopify');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippets: Record<string, { title: string; lang: string; code: string; desc: string }> = {
    shopify: {
      title: 'Shopify theme.liquid Embed',
      lang: 'html',
      desc: 'Paste directly before the closing </head> tag in your Shopify active theme.',
      code: `<!-- ProofPulse Verified Social Proof Widget -->
<script
  async
  src="http://localhost:4000/widget/proofpulse.js"
  data-website-id="pp_pub_live_demo12345"
></script>
<!-- End ProofPulse Widget -->`
    },
    woo: {
      title: 'WooCommerce functions.php Hook',
      lang: 'php',
      desc: 'Add to your WordPress child theme functions.php file.',
      code: `<?php
add_action('wp_head', function() {
  ?>
  <script 
    async 
    src="http://localhost:4000/widget/proofpulse.js" 
    data-website-id="pp_pub_live_demo12345">
  </script>
  <?php
});`
    },
    nextjs: {
      title: 'Next.js 14/15 App Router (app/layout.tsx)',
      lang: 'tsx',
      desc: 'Use Next.js Script component with afterInteractive strategy for optimal Core Web Vitals.',
      code: `import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="http://localhost:4000/widget/proofpulse.js"
          data-website-id="pp_pub_live_demo12345"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`
    },
    curl: {
      title: 'REST API Ingestion (cURL)',
      lang: 'bash',
      desc: 'Send authentic server-side purchases with your private ingestion key.',
      code: `curl -X POST http://localhost:4000/api/v1/events \\
  -H "X-ProofPulse-Key: pp_sec_test_secret_key_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "purchase",
    "source_event_id": "order_998822",
    "occurred_at": "2026-10-18T04:00:00Z",
    "payload": {
      "first_name": "Vikram",
      "city": "Mumbai",
      "item_title": "Handcrafted Leather Bag",
      "amount": 2499,
      "quantity": 1
    }
  }'`
    },
    nodejs: {
      title: 'Node.js / Express Ingestion',
      lang: 'typescript',
      desc: 'Dispatch orders idempotently from your order fulfillment backend.',
      code: `import axios from 'axios';

await axios.post('http://localhost:4000/api/v1/events', {
  event_type: 'purchase',
  source_event_id: order.id,
  occurred_at: new Date().toISOString(),
  payload: {
    first_name: order.customer.firstName,
    city: order.shippingAddress.city,
    item_title: order.items[0].title,
    amount: order.totalAmount
  }
}, {
  headers: {
    'X-ProofPulse-Key': process.env.PROOFPULSE_PRIVATE_KEY,
    'Content-Type': 'application/json'
  }
});`
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2 border border-brand-200 dark:border-brand-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Developer & Merchant Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Integration & API Reference
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Step-by-step instructions for embedding the ProofPulse widget on Shopify, WooCommerce, or custom storefronts, and connecting cryptographically verified order webhooks.
        </p>
      </div>

      {/* Integration Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Register Storefront</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Register your store domain in the Websites tab to receive your Public ID (<code className="text-brand-600">pp_pub_...</code>) and Private API Key (<code className="text-brand-600">pp_sec_...</code>).
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Embed Widget Script</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add our 3KB asynchronous script tag to your store HTML. It runs in an isolated Shadow DOM with zero CSS conflicts.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Connect Webhook Ingestion</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure Shopify order creation webhooks or post directly to <code className="text-brand-600">/api/v1/events</code> with HMAC verification.
          </p>
        </div>
      </div>

      {/* Code Snippets Interactive Explorer */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-600" />
              Code Snippets & Platform Guides
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your platform below to copy the ready-to-use snippet.
            </p>
          </div>

          {/* Platform Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold overflow-x-auto">
            {(['shopify', 'woo', 'nextjs', 'curl', 'nodejs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'woo' ? 'WooCommerce' : tab === 'nextjs' ? 'Next.js' : tab === 'curl' ? 'cURL API' : tab === 'nodejs' ? 'Node.js' : 'Shopify'}
              </button>
            ))}
          </div>
        </div>

        {/* Current Snippet Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {snippets[activeTab].title}
            </span>
            <span className="text-slate-400">{snippets[activeTab].desc}</span>
          </div>

          <div className="relative rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
            <pre><code>{snippets[activeTab].code}</code></pre>
            <button
              onClick={() => copyCode(snippets[activeTab].code)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy snippet"
            >
              {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Security & Verification Details */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Cryptographic Provenance & Anti-Deception Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">HMAC-SHA256 Webhook Verification</span>
            <p className="leading-relaxed">
              When Shopify sends an <code className="text-brand-600">orders/create</code> webhook, ProofPulse calculates an HMAC hash using your app secret and compares it using timing-safe buffer comparison. Unsigned or forged webhooks are immediately rejected with <code className="text-red-500">401 Unauthorized</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">Strict Idempotency</span>
            <p className="leading-relaxed">
              Every event is keyed by <code className="text-brand-600">(website_id, source, source_event_id)</code>. If your server or Shopify retries a webhook delivery, ProofPulse returns <code className="text-emerald-600">200 idempotent_duplicate</code> and guarantees zero duplicate notifications or inflated counts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">Data Minimization (DPDP Act)</span>
            <p className="leading-relaxed">
              ProofPulse automatically strips full customer names, phone numbers, email addresses, and physical street addresses at the API ingestion boundary. Only display names (<code className="text-brand-600">Pooja from Bengaluru</code>) are persisted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block text-sm">Zero Manipulation Scarcity</span>
            <p className="leading-relaxed">
              Low-stock alerts require authoritative store inventory numbers. Countdown offers require genuine, immutable expiration deadlines. If an event source becomes stale or unavailable, the notification is suppressed automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
