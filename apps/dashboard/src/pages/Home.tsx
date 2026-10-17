import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Code2,
  ExternalLink,
  Store,
  ChevronRight,
  Flame,
  X,
  CreditCard
} from 'lucide-react';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { PLAN_CONFIGS } from '@proofpulse/config';

export const Home: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeHeroCard, setActiveHeroCard] = useState<number>(0);

  // Auto-rotate hero preview cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroCard((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const heroCards = [
    {
      icon: '🛍️',
      title: 'Priya in Bengaluru',
      subtitle: 'Purchased Handcrafted Silk Saree',
      verifiedText: 'Verified Shopify Order • 4m ago',
      badge: 'Recent Purchase'
    },
    {
      icon: '👀',
      title: '24 people viewing right now',
      subtitle: 'Real-time verified store activity',
      verifiedText: 'Zero Fake Multipliers • Live Telemetry',
      badge: 'Live Visitors'
    },
    {
      icon: '🔥',
      title: 'Only 3 items left in stock!',
      subtitle: 'Kashmiri Pashmina Shawl is selling fast',
      verifiedText: 'Authoritative Store Catalog Sync',
      badge: 'Low Stock Alert'
    },
    {
      icon: '⏳',
      title: 'Diwali Festive Sale',
      subtitle: 'Offer ends in 03h 45m 12s',
      verifiedText: 'Server-Enforced Fixed Deadline',
      badge: 'Genuine Countdown'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-brand-600/25 via-indigo-600/15 to-purple-600/5 rounded-full blur-[140px]"></div>
        <div className="absolute top-[600px] -left-40 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[1400px] -right-40 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Modern Marketing Header */}
      <header className="relative z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
            ProofPulse
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
              TRUTH ENGINE
            </span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition">Notification Types</a>
          <a href="#truth-engine" className="hover:text-white transition">Truth Engine</a>
          <a href="#integration" className="hover:text-white transition">Integration</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <NavLink to="/dashboard/docs" className="hover:text-white transition">Documentation</NavLink>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/25 transition active:scale-95"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-inner backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-Fabrication Guarantee • Cryptographically Verified Provenance</span>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            Turn Storefront Visitors Into{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Confident Buyers.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Display authentic verified customer orders, real-time presence meters, and authoritative inventory scarcity. Zero fabricated popups. Zero fake countdown timers.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <NavLink
            to="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <span>Start Free Trial (No Credit Card)</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>

          <button
            onClick={() => setPreviewOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Open Live Preview Studio</span>
          </button>
        </div>

        {/* Supported Platform Badges */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
          <span className="font-semibold text-slate-300">Works seamlessly with:</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            🟢 Shopify (1-Click App / Liquid)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            🟣 WooCommerce
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            ⚡ Next.js / React
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            🔌 Direct REST API
          </span>
        </div>

        {/* Interactive Floating Card Simulator In Hero */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="p-1 rounded-2xl bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-transparent shadow-2xl">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block">
                  Simulated Storefront Display
                </span>
                <h3 className="text-lg font-bold text-white">
                  Isolated Shadow DOM Notification Card
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Weighs only 3.09 KB gzipped. Operates in an encapsulated closed Shadow DOM so your store styles never break.
                </p>
                <div className="flex gap-2 pt-2">
                  {heroCards.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveHeroCard(i)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                        activeHeroCard === i
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Live Floating Card */}
              <div className="w-full sm:w-80 p-3.5 rounded-xl bg-white text-slate-900 shadow-2xl border border-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xl shrink-0">
                    {heroCards[activeHeroCard].icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold truncate">
                      {heroCards[activeHeroCard].title}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">
                      {heroCards[activeHeroCard].subtitle}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{heroCards[activeHeroCard].verifiedText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 6 NOTIFICATION TYPES */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Authoritative Signal Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            6 Legitimate Social Proof Signals
          </h2>
          <p className="text-sm text-slate-400">
            ProofPulse connects to authoritative inventory, order feeds, and live presence to display real proof that converts shoppers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Recent Purchase */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800/60 text-brand-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              🛍️
            </div>
            <h3 className="text-base font-bold text-white">Recent Verified Purchases</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time purchase notifications triggered exclusively by signed webhooks from Shopify, WooCommerce, or your server API. Full customer names and addresses are permanently stripped.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> HMAC-SHA256 Signed
            </div>
          </div>

          {/* 2. Recent Signups */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              🎉
            </div>
            <h3 className="text-base font-bold text-white">Recent Verified Signups</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Showcase community registration activity, newsletter signups, or webinar enrollments. Validated against real user creation timestamps.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified User Timestamp
            </div>
          </div>

          {/* 3. Product Popularity */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              📈
            </div>
            <h3 className="text-base font-bold text-white">Product Order Volumes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Displays authentic historical popularity ("Ordered 48 times in the last 24 hours") computed directly from real database order records without arbitrary inflation.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> True Rolling 24h Aggregates
            </div>
          </div>

          {/* 4. Live Visitors */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              👀
            </div>
            <h3 className="text-base font-bold text-white">Active Live Visitors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time presence based on measurable 5-minute visitor heartbeat telemetry. Completely bans random multipliers, synthetic multipliers, or fake random counters.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Multipliers Guarantee
            </div>
          </div>

          {/* 5. Low-Stock Warnings */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              🔥
            </div>
            <h3 className="text-base font-bold text-white">Catalog Low-Stock Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers legitimate urgency when store inventory drops below your configured threshold (e.g. "Only 3 items left in stock"). Backed by authoritative store sync.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authoritative Inventory Sync
            </div>
          </div>

          {/* 6. Genuine Countdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-105 transition">
              ⏳
            </div>
            <h3 className="text-base font-bold text-white">Fixed Genuine Countdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flash sales and seasonal promotions with an immutable, server-enforced deadline. Prohibits deceptive countdown timers that reset on every page refresh.
            </p>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Expiration Clock
            </div>
          </div>
        </div>
      </section>

      {/* TRUTH ENGINE COMPARISON TABLE */}
      <section id="truth-engine" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Why Authenticity Wins
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            ProofPulse vs. Legacy "Urgency" Tools
          </h2>
          <p className="text-sm text-slate-400">
            Modern Indian consumers and international shoppers immediately spot fake countdowns and synthetic numbers. Here is how ProofPulse restores trust.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-3 p-4 bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <div>Feature / Capability</div>
            <div className="text-brand-400">ProofPulse Truth Engine</div>
            <div className="text-slate-500">Legacy Social Proof Apps</div>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-200">Event Authenticity</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Signed Webhook Verification
              </span>
              <span className="text-red-400 font-medium">Random Fake Purchases Allowed</span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-200">Countdown Timers</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Server-Enforced Hard Deadline
              </span>
              <span className="text-red-400 font-medium">Resets Every Page Refresh</span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-200">Live Visitor Counts</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Measured 5-min Active Sessions
              </span>
              <span className="text-red-400 font-medium">Synthetic Multipliers (10x-50x)</span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-200">Customer Privacy (DPDP Act)</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Pseudonymized & Minimised
              </span>
              <span className="text-red-400 font-medium">Exposes Full Names & Street Addresses</span>
            </div>

            <div className="grid grid-cols-3 p-4 items-center">
              <span className="font-semibold text-slate-200">Widget Footprint</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> 3.09 KB (Isolated Shadow DOM)
              </span>
              <span className="text-slate-400 font-medium">100KB+ (Leaking CSS Styles)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP INTEGRATION SECTION */}
      <section id="integration" className="relative z-10 py-20 px-4 sm:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Developer Friendly & Non-Technical Ready
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Install in 3 Minutes
          </h2>
          <p className="text-sm text-slate-400">
            Zero dependencies. Copy one snippet into Shopify, WooCommerce, or your custom store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="font-bold text-white text-base">Register Your Domain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add your store URL in the dashboard to generate your public identifier (<code className="text-brand-400">pp_pub_live_...</code>) and secure webhook secret.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="font-bold text-white text-base">Paste Embed Snippet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste the single-line script right before the closing <code className="text-brand-400">&lt;/head&gt;</code> tag. It loads asynchronously without blocking page rendering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="font-bold text-white text-base">Verify Orders Automatically</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shopify webhooks or our REST API will automatically ingest, verify, and rotate authentic purchase notifications to your visitors.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <NavLink
            to="/dashboard/docs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
          >
            <span>Read full developer documentation with code samples for Shopify, WooCommerce, & Next.js</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </section>

      {/* TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Tailored For Indian SMBs & Global Scale
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simple, Predictable Monthly Pricing
          </h2>
          <p className="text-sm text-slate-400">
            No hidden setup fees. Upgrade or cancel anytime directly in your self-service dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.values(PLAN_CONFIGS).map((p) => {
            const isFeatured = p.id === 'growth';
            return (
              <div
                key={p.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  isFeatured
                    ? 'border-brand-500 bg-slate-900/90 shadow-2xl shadow-brand-500/15'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-bold text-[10px] tracking-wide uppercase shadow">
                    Most Popular for Stores
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{p.price_formatted}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Up to <strong>{p.features.websites_limit}</strong> store domain(s)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span><strong>{p.features.impressions_limit_monthly.toLocaleString()}</strong> monthly impressions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span><strong>{p.features.event_freshness_hours}h</strong> event freshness limit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span><strong>{p.features.analytics_history_days}d</strong> analytics retention</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{p.features.custom_branding ? 'Custom branding & CSS' : 'ProofPulse badge'}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <NavLink
                    to="/dashboard/billing"
                    className={`w-full py-2.5 rounded-xl text-center block font-bold text-xs transition ${
                      isFeatured
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    Select {p.name}
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 py-16 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-950 to-slate-900 border border-brand-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Build Authentic Social Proof?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Join modern e-commerce brands in India elevating store conversions with transparent, verified social proof and legitimate urgency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink
              to="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition"
            >
              Start Free (1-Minute Setup)
            </NavLink>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm">ProofPulse</span>
            <span className="text-slate-500 ml-2">© 2026 ProofPulse Inc. Engineered for Indian & Global SMBs.</span>
          </div>

          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="hover:text-slate-200">Merchant Dashboard</NavLink>
            <NavLink to="/dashboard/docs" className="hover:text-slate-200">Integration Docs</NavLink>
            <a href="http://localhost:4000/api-docs" target="_blank" rel="noreferrer" className="hover:text-slate-200">
              API Reference
            </a>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> DPDP Act Compliant
            </span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Preview Modal */}
      <CampaignPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};
