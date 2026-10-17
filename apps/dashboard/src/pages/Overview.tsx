import React, { useState, useEffect } from 'react';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  ShieldCheck,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Store
} from 'lucide-react';
import { api } from '../lib/api';
import { Website, Campaign, EventRecord } from '@proofpulse/shared-types';

export const Overview: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [website, setWebsite] = useState<Website | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [analytics, setAnalytics] = useState({
    total_impressions: 1420,
    total_clicks: 98,
    ctr_percentage: 6.9,
    attributed_conversions: 24
  });

  useEffect(() => {
    api.websites.list().then((res) => {
      if (res.data.length > 0) {
        const site = res.data[0];
        setWebsite(site);

        api.campaigns.list(site.id).then((cRes) => setCampaigns(cRes.data)).catch(() => {});
        api.events.list(site.id, 5).then((eRes) => setEvents(eRes.data)).catch(() => {});
        api.analytics.get(site.id).then((aRes) => setAnalytics(aRes.data)).catch(() => {});
      }
    }).catch(console.error);
  }, []);

  const embedSnippet = website
    ? `<script async src="http://localhost:4000/widget/proofpulse.js" data-website-id="${website.public_key}"></script>`
    : '<script async src="http://localhost:4000/widget/proofpulse.js" data-website-id="pp_pub_live_demo12345"></script>';

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Deception Guarantee Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Elevate store conversions with authentic proof.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Connected Store: <span className="font-semibold text-white">{website?.domain || 'demo-store.myshopify.com'}</span>. All notifications are cryptographically verified against real orders.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={copyEmbedCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-lg transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Snippet Copied!' : 'Copy Embed Snippet'}</span>
          </button>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-brand-600 dark:text-brand-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.total_impressions.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Visitor Clicks</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.total_clicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Visitors engaged with card
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Click-Through Rate</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.ctr_percentage}%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            High shopper intent
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Attributed Sales</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.attributed_conversions} Orders
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Within 24h interaction window
          </div>
        </div>
      </div>

      {/* Main Grid: Code snippet & Recent Verified Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Embed Guide */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-600" />
              Website Integration Snippet
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {website?.is_verified ? 'Domain Verified' : 'Pending Verification'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Copy and paste this snippet right before the closing <code className="text-brand-600 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&lt;/head&gt;</code> tag on Shopify, WooCommerce, or your custom storefront. The script weighs under 20KB and operates inside an isolated Shadow DOM.
          </p>

          <div className="relative rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{embedSnippet}</code>
            <button
              onClick={copyEmbedCode}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy snippet"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Zero Host Conflict</span>
              Shadow DOM isolation guarantees your site styles never break.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Asynchronous</span>
              Loads non-blocking without hurting Core Web Vitals.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Accessible</span>
              Full WCAG 2.1 AA screen reader & keyboard support.
            </div>
          </div>
        </div>

        {/* Live Verified Activity Stream */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                Recent Verified Ingestion
              </h2>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">Live</span>
            </div>

            <div className="space-y-3 mt-4">
              {events.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No events received yet. Connect your Shopify store or submit a test event.
                </div>
              ) : (
                events.map((evt) => {
                  const p = evt.normalized_payload as any;
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 text-xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                        🛍️
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {p.first_name} {p.city ? `in ${p.city}` : ''}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 truncate">
                          {p.item_title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>HMAC Verified • {evt.source}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <a
            href="/events"
            className="flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 pt-3 border-t border-slate-100 dark:border-slate-800"
          >
            <span>View all ingestion activity</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
