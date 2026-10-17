import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { PlanConfig } from '@proofpulse/config';
import { PlanTier, Subscription } from '@proofpulse/shared-types';

export const Billing: React.FC = () => {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanConfig | null>(null);
  const [usage, setUsage] = useState({
    impressions_used: 1420,
    impressions_limit: 100000,
    websites_used: 1,
    websites_limit: 5,
    period_month: '2026-10'
  });
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBilling = () => {
    api.billing.getPlans().then((res) => setPlans(res.data)).catch(console.error);
    api.billing.getSubscription().then((res) => {
      setSubscription(res.data.subscription);
      setCurrentPlan(res.data.plan);
    }).catch(console.error);

    api.websites.list().then((res) => {
      if (res.data.length > 0) {
        api.analytics.getUsage(res.data[0].id).then((uRes) => {
          setUsage(uRes.data);
        }).catch(() => {});
      }
    });
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleUpgrade = async (tier: PlanTier) => {
    setUpgradingTier(tier);
    try {
      await api.billing.upgrade(tier);
      setSuccessMsg(`Successfully upgraded to ${tier.toUpperCase()} plan!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchBilling();
    } catch (err: any) {
      alert(`Upgrade failed: ${err.message}`);
    } finally {
      setUpgradingTier(null);
    }
  };

  const impressionPercent = Math.min(100, Math.round((usage.impressions_used / usage.impressions_limit) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-600" />
          Subscription & Usage Quotas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Transparent, server-enforced pricing tailored for high-growth e-commerce in India and worldwide.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quota Progress Meter Card */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Current Billing Cycle ({usage.period_month})
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Monthly Resource Quota
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Active Plan:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase">
              {subscription?.plan_tier || 'Growth'} Tier
            </span>
          </div>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Impressions Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Widget Notification Impressions</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {usage.impressions_used.toLocaleString()} / {usage.impressions_limit.toLocaleString()} ({impressionPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${impressionPercent}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Resets at the start of next calendar month.
            </span>
          </div>

          {/* Websites Limit */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Connected Storefront Domains</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {usage.websites_used} of {usage.websites_limit} stores
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(usage.websites_used / usage.websites_limit) * 100}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Includes Shopify, WooCommerce, and custom web stores.
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Tier Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = subscription?.plan_tier === p.id;
          const isFeatured = p.id === 'growth';
          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
                isCurrent
                  ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md'
                  : isFeatured
                  ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-lg'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-bold text-[10px] tracking-wide uppercase shadow">
                  Most Popular for SMBs
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{p.price_formatted}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Up to <strong>{p.features.websites_limit}</strong> store domain(s)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span><strong>{p.features.impressions_limit_monthly.toLocaleString()}</strong> monthly impressions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span><strong>{p.features.event_freshness_hours}h</strong> event freshness limit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span><strong>{p.features.analytics_history_days}d</strong> analytics retention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{p.features.custom_branding ? 'Custom branding & CSS' : 'ProofPulse badge'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgradingTier !== null}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition active:scale-95"
                  >
                    {upgradingTier === p.id ? 'Upgrading...' : `Select ${p.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
