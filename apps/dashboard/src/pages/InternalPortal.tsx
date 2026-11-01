import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Layers,
  ExternalLink,
  Calendar,
  Sparkles,
  Building2,
  TrendingUp,
  X,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Shield,
  Clock,
  Radio,
  Server,
  Database,
  Terminal,
  Lock,
  ArrowRight,
  Cpu,
  Flame,
  Pause,
  Play
} from 'lucide-react';
import { api } from '../lib/api';
import {
  AdminMerchantOverview,
  AdminMetricsSummary,
  AdminIntegrationStatus,
  PlanTier
} from '@proofpulse/shared-types';

export const InternalPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active view tab synced with URL route
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/subscriptions')) return 'subscriptions';
    if (path.includes('/integrations')) return 'integrations';
    if (path.includes('/telemetry')) return 'telemetry';
    if (path.includes('/audit')) return 'audit';
    return 'merchants';
  }, [location.pathname]);

  // Real-time State
  const [merchants, setMerchants] = useState<AdminMerchantOverview[]>([]);
  const [metrics, setMetrics] = useState<AdminMetricsSummary | null>(null);
  const [subscriptionOps, setSubscriptionOps] = useState<any | null>(null);
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Telemetry & Polling controls
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [livePolling, setLivePolling] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Initializing...');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIntegration, setSelectedIntegration] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Detail Modal State
  const [inspectMerchant, setInspectMerchant] = useState<AdminMerchantOverview | null>(null);
  const [detailedData, setDetailedData] = useState<{
    websites_detailed: any[];
    audit_logs: any[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Override Subscription State
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [targetWorkspace, setTargetWorkspace] = useState<AdminMerchantOverview | null>(null);
  const [overrideTier, setOverrideTier] = useState<PlanTier>('growth');
  const [overrideStatus, setOverrideStatus] = useState<string>('active');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideSubmitting, setOverrideSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Central real-time data fetcher
  const loadRealtimeData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const [metricsRes, merchantsRes, subsRes, intRes, telRes, auditRes] = await Promise.all([
        api.admin.getMetrics(),
        api.admin.listMerchants(),
        api.admin.getSubscriptions(),
        api.admin.getIntegrations(),
        api.admin.getTelemetry(),
        api.admin.getAuditLogs(50)
      ]);

      setMetrics(metricsRes.data);
      setMerchants(merchantsRes.data);
      setSubscriptionOps(subsRes.data);
      setIntegrationsList(intRes.data);
      setTelemetry(telRes.data);
      setAuditLogs(auditRes.data);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Real-time data synchronization error:', err);
    } finally {
      setInitialLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRealtimeData();
  }, [loadRealtimeData]);

  // Real-time automatic polling loop (every 3 seconds when active)
  useEffect(() => {
    if (!livePolling) return;
    const interval = setInterval(() => {
      loadRealtimeData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [livePolling, loadRealtimeData]);

  // Filtered merchants computed dynamically
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = m.full_name?.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchWs = m.workspace_name.toLowerCase().includes(q);
        const matchDomain = m.websites.some((w) => w.domain.toLowerCase().includes(q));
        const matchSubId = m.provider_subscription_id?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchWs && !matchDomain && !matchSubId) {
          return false;
        }
      }

      if (selectedIntegration !== 'all' && m.integration_status !== selectedIntegration) {
        return false;
      }

      if (selectedTier !== 'all' && m.plan_tier !== selectedTier) {
        return false;
      }

      if (selectedStatus !== 'all' && m.subscription_status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [merchants, searchTerm, selectedIntegration, selectedTier, selectedStatus]);

  // Open deep inspection drawer
  const handleInspect = async (merchant: AdminMerchantOverview) => {
    setInspectMerchant(merchant);
    setDetailLoading(true);
    try {
      const res = await api.admin.getMerchant(merchant.workspace_id);
      setDetailedData({
        websites_detailed: res.data.websites_detailed || [],
        audit_logs: res.data.audit_logs || []
      });
    } catch (err) {
      console.error('Failed to fetch merchant details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Plan Override Modal
  const openOverrideDialog = (m: AdminMerchantOverview) => {
    setTargetWorkspace(m);
    setOverrideTier(m.plan_tier);
    setOverrideStatus(m.subscription_status);
    setOverrideReason('Staff customer success override');
    setShowOverrideModal(true);
  };

  // Submit Plan Override
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspace) return;
    setOverrideSubmitting(true);
    try {
      await api.admin.updateSubscription(targetWorkspace.workspace_id, {
        plan_tier: overrideTier,
        status: overrideStatus,
        reason: overrideReason
      });
      setActionSuccessMsg(`Live Plan Updated: "${targetWorkspace.workspace_name}" is now ${overrideTier.toUpperCase()} (${overrideStatus}).`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setShowOverrideModal(false);
      loadRealtimeData();
      if (inspectMerchant && inspectMerchant.workspace_id === targetWorkspace.workspace_id) {
        handleInspect({ ...inspectMerchant, plan_tier: overrideTier, subscription_status: overrideStatus });
      }
    } catch (err: any) {
      alert(`Error updating plan: ${err.message || 'Unknown error'}`);
    } finally {
      setOverrideSubmitting(false);
    }
  };

  // Ingest live simulated test order event
  const handleSimulate = async (m: AdminMerchantOverview) => {
    try {
      const res = await api.admin.simulateEvent(m.workspace_id);
      setActionSuccessMsg(`Real-time Ingestion: ${res.message}`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadRealtimeData();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    }
  };

  // Export CSV of merchants
  const exportToCSV = () => {
    const headers = [
      'Merchant Name',
      'Email',
      'Workspace',
      'Domains',
      'Integration Status',
      'Widget Installed',
      'Webhooks Connected',
      'Plan Tier',
      'MRR (INR)',
      'Subscription Status',
      'Provider Sub ID',
      'Monthly Impressions Used',
      'Impressions Limit',
      'Registered At'
    ];

    const rows = filteredMerchants.map((m) => [
      `"${m.full_name || ''}"`,
      `"${m.email}"`,
      `"${m.workspace_name}"`,
      `"${m.websites.map((w) => w.domain).join(', ')}"`,
      `"${m.integration_status}"`,
      m.widget_installed ? 'YES' : 'NO',
      m.webhooks_connected ? 'YES' : 'NO',
      `"${m.plan_tier}"`,
      m.mrr_inr,
      `"${m.subscription_status}"`,
      `"${m.provider_subscription_id || ''}"`,
      m.impressions_used,
      m.impressions_limit,
      `"${m.registered_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `proofpulse-merchants-registry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Badges
  const renderIntegrationBadge = (status: AdminIntegrationStatus) => {
    switch (status) {
      case 'fully_integrated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            FULLY INTEGRATED
          </span>
        );
      case 'widget_only':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            WIDGET ONLY
          </span>
        );
      case 'events_only':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            WEBHOOKS ONLY
          </span>
        );
      case 'not_integrated':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            NOT INTEGRATED
          </span>
        );
    }
  };

  const renderTierBadge = (tier: PlanTier) => {
    switch (tier) {
      case 'agency':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Agency Scale (₹3,999)
          </span>
        );
      case 'growth':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-500/15 text-brand-300 border border-brand-500/30">
            Business Pro (₹1,499)
          </span>
        );
      case 'starter':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Starter (₹499)
          </span>
        );
      case 'free':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Free (₹0)
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            ACTIVE
          </span>
        );
      case 'past_due':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60">
            PAST DUE
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            CANCELED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp font-mono text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Internal Console Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> STAFF OPERATOR ACCESS
            </span>
            <span className="text-xs text-slate-500 font-mono">Live Telemetry & Tenant Intelligence</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-mono flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span>OPERATOR CONSOLE:</span>
            <span className="text-rose-500 font-sans">REAL-TIME MERCHANT & MEMBERSHIP INTELLIGENCE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Zero hard-coded data. All tenant records, subscription MRR, storefront embed activity, and webhook pipelines stream directly from live services.
          </p>
        </div>

        {/* Polling & Actions Control */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* Live Streaming Toggle */}
          <button
            onClick={() => setLivePolling(!livePolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
              livePolling
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle 3-second real-time polling heartbeat"
          >
            {livePolling ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE STREAM: ON (3s)</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>LIVE STREAM: PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={() => loadRealtimeData()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span>SYNC NOW</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono scrollbar-none">
        <button
          onClick={() => navigate('/internal')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'merchants'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Users className="w-4 h-4 text-rose-400" />
          <span>Merchant Registry ({merchants.length})</span>
        </button>

        <button
          onClick={() => navigate('/internal/subscriptions')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'subscriptions'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Subscriptions & MRR ({subscriptionOps ? `₹${subscriptionOps.total_mrr.toLocaleString('en-IN')}` : '...'})</span>
        </button>

        <button
          onClick={() => navigate('/internal/integrations')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'integrations'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Activity className="w-4 h-4 text-sky-400" />
          <span>Storefronts & Webhooks ({integrationsList.length})</span>
        </button>

        <button
          onClick={() => navigate('/internal/telemetry')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Live Health & Memory ({telemetry ? `${telemetry.memory?.rss_mb} MB` : '...'})</span>
        </button>

        <button
          onClick={() => navigate('/internal/audit')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Real-Time Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Top Real-Time KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total MRR */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">LIVE PLATFORM MRR</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              ₹{metrics.total_mrr_inr.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">{metrics.total_paying_members}</span> paying merchants
            </div>
          </div>

          {/* Total Merchants */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">TOTAL TENANTS</span>
              <div className="w-7 h-7 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {metrics.total_merchants}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-rose-400 font-bold">{metrics.paying_conversion_rate}%</span> paid conversion
            </div>
          </div>

          {/* Integration Rate */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">FULLY INTEGRATED</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {metrics.integration_rate_percentage}%
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-indigo-400 font-bold">{metrics.fully_integrated_merchants}</span> of {metrics.total_merchants} active
            </div>
          </div>

          {/* Verified Stores */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">ACTIVE STOREFRONTS</span>
              <div className="w-7 h-7 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {metrics.total_active_websites}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              verified store domains
            </div>
          </div>

          {/* Total Impressions */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">GLOBAL IMPRESSIONS</span>
              <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {metrics.total_impressions_served.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              toasts delivered live
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MERCHANT & MEMBERSHIP REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Live search by merchant name, email, workspace, domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono w-full lg:w-auto">
                {/* Integration filter */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px] shrink-0">INTEGRATION:</span>
                  <select
                    value={selectedIntegration}
                    onChange={(e) => setSelectedIntegration(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
                  >
                    <option value="all">ALL STATES</option>
                    <option value="fully_integrated">FULLY INTEGRATED</option>
                    <option value="widget_only">WIDGET ONLY</option>
                    <option value="events_only">WEBHOOKS ONLY</option>
                    <option value="not_integrated">NOT INTEGRATED</option>
                  </select>
                </div>

                {/* Tier filter */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px] shrink-0">PLAN:</span>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
                  >
                    <option value="all">ALL TIERS</option>
                    <option value="free">FREE (₹0)</option>
                    <option value="starter">STARTER (₹499)</option>
                    <option value="growth">PRO (₹1,499)</option>
                    <option value="agency">AGENCY (₹3,999)</option>
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-slate-500 text-[11px] shrink-0">STATUS:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="active">ACTIVE</option>
                    <option value="past_due">PAST DUE</option>
                    <option value="canceled">CANCELED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2">
              <span>
                Matching <strong className="text-white">{filteredMerchants.length}</strong> of{' '}
                <strong className="text-white">{merchants.length}</strong> onboarded merchants (Live Stream Synced: {lastSyncTime})
              </span>
              {(searchTerm || selectedIntegration !== 'all' || selectedTier !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedIntegration('all');
                    setSelectedTier('all');
                    setSelectedStatus('all');
                  }}
                  className="text-rose-400 hover:underline self-start sm:self-auto"
                >
                  RESET FILTERS
                </button>
              )}
            </div>
          </div>

          {/* High-Density Merchant Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans min-w-[780px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Merchant & Workspace</th>
                    <th className="py-3 px-4">Connected Storefront(s)</th>
                    <th className="py-3 px-4">Integration Status</th>
                    <th className="py-3 px-4">Membership & MRR</th>
                    <th className="py-3 px-4">Monthly Quota</th>
                    <th className="py-3 px-4 text-right">Staff Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {initialLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                        QUERYING LIVE BACK-OFFICE DATABASE...
                      </td>
                    </tr>
                  ) : filteredMerchants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                        NO MERCHANTS MATCHING CURRENT CRITERIA.
                      </td>
                    </tr>
                  ) : (
                    filteredMerchants.map((m) => (
                      <tr key={m.workspace_id} className="hover:bg-slate-800/40 transition group">
                        {/* Merchant */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {m.full_name
                                ? m.full_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                                : 'MC'}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {m.workspace_name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {m.full_name || 'N/A'} • <span className="text-slate-300">{m.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Storefronts */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="space-y-1">
                            {m.websites.map((site) => (
                              <div key={site.id} className="flex items-center gap-1.5">
                                {site.is_verified ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                )}
                                <a
                                  href={site.canonical_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-300 hover:text-rose-400 flex items-center gap-1"
                                >
                                  {site.domain}
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              </div>
                            ))}
                            {m.websites.length === 0 && (
                              <span className="text-slate-500 italic">No domain registered</span>
                            )}
                          </div>
                        </td>

                        {/* Integration Status */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-1">
                            <div>{renderIntegrationBadge(m.integration_status)}</div>
                            <div className="text-[10px] text-slate-400">
                              Widget: <span className={m.widget_installed ? 'text-emerald-400' : 'text-slate-500'}>{m.widget_installed ? 'Active' : 'Offline'}</span> • Webhooks: <span className={m.webhooks_connected ? 'text-emerald-400' : 'text-slate-500'}>{m.total_events_ingested} ev</span>
                            </div>
                          </div>
                        </td>

                        {/* Membership & MRR */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {renderTierBadge(m.plan_tier)}
                              {renderStatusBadge(m.subscription_status)}
                            </div>
                            <div className="text-xs font-mono font-bold text-white">
                              {m.mrr_inr > 0 ? `₹${m.mrr_inr.toLocaleString('en-IN')}/mo` : '₹0 / Free'}
                            </div>
                            {m.provider_subscription_id && (
                              <div className="text-[10px] font-mono text-slate-500">
                                {m.provider_subscription_id}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quota */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{m.impressions_used.toLocaleString()}</span>
                              <span>{m.impressions_limit.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  m.quota_usage_percentage > 90
                                    ? 'bg-rose-500'
                                    : m.quota_usage_percentage > 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, m.quota_usage_percentage)}%` }}
                              ></div>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {m.quota_usage_percentage}% consumed
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleInspect(m)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Audit Merchant Deep-Dive"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openOverrideDialog(m)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 transition"
                              title="Override Subscription / VIP Comp"
                            >
                              PLAN COMP
                            </button>

                            <button
                              onClick={() => handleSimulate(m)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition"
                              title="Inject Real Verified Order Webhook"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE SUBSCRIPTIONS & REVENUE OPERATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'subscriptions' && subscriptionOps && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">FREE STARTER (₹0)</span>
              <div className="text-xl font-bold text-white mt-1">
                {subscriptionOps.tier_breakdown?.free?.count || 0} Stores
              </div>
              <span className="text-[10px] text-slate-400">₹0 MRR</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-blue-400 text-[10px] block">GROWTH STARTER (₹499)</span>
              <div className="text-xl font-bold text-white mt-1">
                {subscriptionOps.tier_breakdown?.starter?.count || 0} Stores
              </div>
              <span className="text-[10px] text-emerald-400">
                ₹{(subscriptionOps.tier_breakdown?.starter?.mrr || 0).toLocaleString('en-IN')} MRR
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-brand-400 text-[10px] block">BUSINESS PRO (₹1,499)</span>
              <div className="text-xl font-bold text-white mt-1">
                {subscriptionOps.tier_breakdown?.growth?.count || 0} Stores
              </div>
              <span className="text-[10px] text-emerald-400">
                ₹{(subscriptionOps.tier_breakdown?.growth?.mrr || 0).toLocaleString('en-IN')} MRR
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-purple-400 text-[10px] block">AGENCY SCALE (₹3,999)</span>
              <div className="text-xl font-bold text-white mt-1">
                {subscriptionOps.tier_breakdown?.agency?.count || 0} Stores
              </div>
              <span className="text-[10px] text-emerald-400">
                ₹{(subscriptionOps.tier_breakdown?.agency?.mrr || 0).toLocaleString('en-IN')} MRR
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Gateway Subscription Registry ({subscriptionOps.subscriptions?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live database records: Gateway customer IDs, subscription references, renewal cycles, and auto-renew status.
                </p>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-emerald-400 font-bold shrink-0">
                Total Live MRR: ₹{subscriptionOps.total_mrr?.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <th className="py-2.5">Workspace</th>
                    <th className="py-2.5">Plan Tier</th>
                    <th className="py-2.5">Live MRR</th>
                    <th className="py-2.5">Gateway Sub ID</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Renewal / Expiry</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {subscriptionOps.subscriptions?.map((s: any) => (
                    <tr key={s.workspace_id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-sans font-bold text-white">
                        {s.workspace_name}
                        <span className="block text-[11px] font-mono text-slate-500">{s.email}</span>
                      </td>
                      <td className="py-3">{renderTierBadge(s.plan_tier)}</td>
                      <td className="py-3 font-bold text-emerald-400">
                        {s.mrr_inr > 0 ? `₹${s.mrr_inr.toLocaleString('en-IN')}/mo` : '₹0'}
                      </td>
                      <td className="py-3 text-slate-400">{s.provider_subscription_id || 'None (Free Plan)'}</td>
                      <td className="py-3">{renderStatusBadge(s.subscription_status)}</td>
                      <td className="py-3 text-slate-400">
                        {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'Active Ongoing'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const found = merchants.find((m) => m.workspace_id === s.workspace_id);
                            if (found) openOverrideDialog(found);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-[11px]"
                        >
                          Modify Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REAL-TIME STOREFRONTS & WEBHOOKS INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Storefronts & Ingestion Inventory ({integrationsList.length} Connected)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live telemetry: Verified domains, public API keys, last widget ping, and last verified webhook ingestion.
                </p>
              </div>
              <span className="text-slate-400 font-mono text-xs shrink-0">
                Verified: <strong className="text-emerald-400">{integrationsList.filter((i) => i.is_verified).length}</strong> / {integrationsList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <th className="py-2.5">Domain</th>
                    <th className="py-2.5">Merchant Workspace</th>
                    <th className="py-2.5">Verification</th>
                    <th className="py-2.5">Last Widget Activity</th>
                    <th className="py-2.5">Last Webhook Activity</th>
                    <th className="py-2.5">Events Ingested</th>
                    <th className="py-2.5 text-right">Trigger Test Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {integrationsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-3 text-white font-bold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-400" />
                        <span>{item.domain}</span>
                      </td>
                      <td className="py-3 text-slate-300 font-sans">{item.workspace_name}</td>
                      <td className="py-3">
                        {item.is_verified ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-400">
                        {item.last_widget_activity_at ? new Date(item.last_widget_activity_at).toLocaleTimeString() : 'Never'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {item.last_event_at ? new Date(item.last_event_at).toLocaleTimeString() : 'Never'}
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">
                        {item.total_events} events
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const found = merchants.find((m) => m.workspace_id === item.workspace_id);
                            if (found) handleSimulate(found);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px]"
                        >
                          Send Test Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE PLATFORM TELEMETRY & SYSTEM HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry' && telemetry && (
        <div className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">PROCESS UPTIME</span>
              <div className="text-emerald-400 font-bold text-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {telemetry.uptime_formatted}
              </div>
              <span className="text-[10px] text-slate-400">Process ID: {telemetry.process?.pid}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">RSS MEMORY</span>
              <div className="text-white font-bold text-lg">
                {telemetry.memory?.rss_mb} MB
              </div>
              <span className="text-[10px] text-slate-400">Heap Used: {telemetry.memory?.heap_used_mb} MB</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">INGESTED ORDER EVENTS</span>
              <div className="text-amber-400 font-bold text-lg">
                {telemetry.platform_counts?.events_ingested} Verified
              </div>
              <span className="text-[10px] text-slate-400">Freshness window: 48h active</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] block uppercase">AUDIT LOG RECORDS</span>
              <div className="text-purple-400 font-bold text-lg">
                {telemetry.platform_counts?.audit_logs} Logged
              </div>
              <span className="text-[10px] text-slate-400">Full audit trail persisted</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400 font-bold text-sm">
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Live Node.js Telemetry Payload
              </span>
              <span className="text-xs text-slate-500 font-mono">Streamed from: GET /api/v1/admin/telemetry</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-[11px] text-emerald-400 overflow-x-auto border border-slate-800 max-h-96">
{JSON.stringify(telemetry, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REAL-TIME AUDIT TRAIL STREAM */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white font-mono text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Real-Time Platform Security & Audit Stream ({auditLogs.length} Records)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable event log of administrative plan overrides, manual comps, website DNS verifications, and staff test injections.
                </p>
              </div>
              <button
                onClick={() => loadRealtimeData()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <RefreshCw className="w-3 h-3 text-purple-400" />
                <span>REFRESH STREAM</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                    <th className="py-2.5">Timestamp</th>
                    <th className="py-2.5">Action Type</th>
                    <th className="py-2.5">Actor</th>
                    <th className="py-2.5">Workspace Target</th>
                    <th className="py-2.5">Audit Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No audit events recorded in this session yet. Any staff plan overrides or test event injections will stream here live.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log: any) => {
                      const ws = merchants.find((m) => m.workspace_id === log.workspace_id);
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30">
                          <td className="py-3 text-slate-400 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 text-white font-semibold">
                            {log.actor_id || 'system'}
                          </td>
                          <td className="py-3 text-slate-300 font-sans font-bold">
                            {ws?.workspace_name || log.workspace_id}
                          </td>
                          <td className="py-3 text-slate-400">
                            <code className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {JSON.stringify(log.metadata)}
                            </code>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEEP DIVE AUDIT DRAWER (MODAL) */}
      {/* ========================================================================= */}
      {inspectMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-sans">
                      {inspectMerchant.workspace_name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      WORKSPACE ID: {inspectMerchant.workspace_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectMerchant(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Integration</div>
                  <div className="mt-1">{renderIntegrationBadge(inspectMerchant.integration_status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Membership</div>
                  <div className="mt-1 flex items-center gap-1 font-bold">
                    {renderTierBadge(inspectMerchant.plan_tier)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">MRR Value</div>
                  <div className="mt-1 font-bold text-emerald-400 text-sm">
                    {inspectMerchant.mrr_inr > 0 ? `₹${inspectMerchant.mrr_inr.toLocaleString('en-IN')}` : '₹0'}
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-400">Account Registry Details</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="text-slate-200">{inspectMerchant.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-rose-400">{inspectMerchant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway Provider:</span>
                    <span className="capitalize text-slate-200">{inspectMerchant.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription Ref:</span>
                    <span className="text-slate-300">{inspectMerchant.provider_subscription_id || 'None (Free Plan)'}</span>
                  </div>
                </div>
              </div>

              {/* Websites Audit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
                    Storefronts & Embed Keys ({inspectMerchant.websites.length})
                  </h3>
                  <button
                    onClick={() => handleSimulate(inspectMerchant)}
                    className="flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:underline"
                  >
                    <Zap className="w-3 h-3" /> Test Webhook Ping
                  </button>
                </div>

                {inspectMerchant.websites.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-400" />
                        {w.domain}
                      </span>
                      {w.is_verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                          PENDING
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>Last Widget Ping: <strong className="text-white">{w.last_widget_activity_at ? new Date(w.last_widget_activity_at).toLocaleTimeString() : 'Never'}</strong></div>
                      <div>Last Webhook Ingest: <strong className="text-white">{w.last_event_at ? new Date(w.last_event_at).toLocaleTimeString() : 'Never'}</strong></div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Storefront Embed Key</div>
                      <code className="block p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 select-all overflow-x-auto">
                        {w.public_key}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ingestion Stream */}
              {detailedData && detailedData.websites_detailed.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
                    Live Verified Ingested Events (Recent)
                  </h3>
                  {detailedData.websites_detailed.map((s: any) => (
                    <div key={s.id} className="space-y-1.5 font-mono text-xs">
                      {s.recent_events && s.recent_events.length > 0 ? (
                        s.recent_events.map((ev: any) => (
                          <div
                            key={ev.id}
                            className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-white">
                                {ev.normalized_payload?.first_name} ({ev.normalized_payload?.city || 'India'})
                              </span>{' '}
                              bought <span className="text-slate-300 italic">{ev.normalized_payload?.item_title}</span>
                            </div>
                            <span className="text-emerald-400 font-bold">
                              {ev.normalized_payload?.amount_formatted || '₹1,999'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-slate-500 italic text-center">
                          No webhook events delivered yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 font-mono text-xs">
              <button
                onClick={() => setInspectMerchant(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-center"
              >
                CLOSE DRAWER
              </button>

              <button
                onClick={() => openOverrideDialog(inspectMerchant)}
                className="px-4 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>ADJUST SUBSCRIPTION / VIP COMP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAFF PLAN OVERRIDE MODAL */}
      {/* ========================================================================= */}
      {showOverrideModal && targetWorkspace && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white font-sans text-sm">
                  Back-Office Subscription Adjustment
                </h3>
              </div>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Target Merchant Workspace</label>
                <input
                  type="text"
                  disabled
                  value={targetWorkspace.workspace_name}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Membership Tier Override</label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value as PlanTier)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="free">Free Starter (₹0/mo - 2,000 imp)</option>
                  <option value="starter">Growth Starter (₹499/mo - 20,000 imp)</option>
                  <option value="growth">Business Pro (₹1,499/mo - 100,000 imp)</option>
                  <option value="agency">Agency Scale (₹3,999/mo - 500,000 imp)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Billing Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="active">Active (Full features enabled)</option>
                  <option value="past_due">Past Due (Payment retry pending)</option>
                  <option value="canceled">Canceled (Downgraded to Free limits)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit Reason Note (Required)</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. VIP comp, enterprise POC, wire transfer reconciliation..."
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white focus:ring-1 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
                >
                  {overrideSubmitting ? 'UPDATING...' : 'SAVE OVERRIDE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
