import React, { useState, useEffect, useMemo } from 'react';
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
  Radio
} from 'lucide-react';
import { api } from '../lib/api';
import {
  AdminMerchantOverview,
  AdminMetricsSummary,
  AdminIntegrationStatus,
  PlanTier
} from '@proofpulse/shared-types';

export const InternalPortal: React.FC = () => {
  const [merchants, setMerchants] = useState<AdminMerchantOverview[]>([]);
  const [metrics, setMetrics] = useState<AdminMetricsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

  // Fetch metrics & merchant list
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [metricsRes, merchantsRes] = await Promise.all([
        api.admin.getMetrics(),
        api.admin.listMerchants()
      ]);
      setMetrics(metricsRes.data);
      setMerchants(merchantsRes.data);
    } catch (err) {
      console.error('Failed to load internal admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered merchants computed locally for responsiveness
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
      setActionSuccessMsg(`Subscription for "${targetWorkspace.workspace_name}" updated to ${overrideTier.toUpperCase()} (${overrideStatus}).`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      setShowOverrideModal(false);
      loadData();
      if (inspectMerchant && inspectMerchant.workspace_id === targetWorkspace.workspace_id) {
        handleInspect({ ...inspectMerchant, plan_tier: overrideTier, subscription_status: overrideStatus });
      }
    } catch (err: any) {
      alert(`Error updating plan: ${err.message || 'Unknown error'}`);
    } finally {
      setOverrideSubmitting(false);
    }
  };

  // Trigger test simulated event
  const handleSimulate = async (m: AdminMerchantOverview) => {
    try {
      const res = await api.admin.simulateEvent(m.workspace_id);
      setActionSuccessMsg(`Event simulated for ${m.workspace_name}! ${res.message}`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadData();
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
    link.setAttribute('download', `proofpulse-merchants-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helpers for badge styling
  const renderIntegrationBadge = (status: AdminIntegrationStatus) => {
    switch (status) {
      case 'fully_integrated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Fully Integrated
          </span>
        );
      case 'widget_only':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Widget Only
          </span>
        );
      case 'events_only':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Webhooks Only
          </span>
        );
      case 'not_integrated':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Not Integrated
          </span>
        );
    }
  };

  const renderTierBadge = (tier: PlanTier) => {
    switch (tier) {
      case 'agency':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Agency Scale
          </span>
        );
      case 'growth':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30">
            Business Pro
          </span>
        );
      case 'starter':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            Starter
          </span>
        );
      case 'free':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            Free
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            Past Due
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Canceled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Banner / Success Toast */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Staff Only
            </span>
            <span className="text-xs text-slate-400">ProofPulse Operations & Growth Subsystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Internal Merchant & Membership Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track all onboarded merchants, verify storefront integration health, and manage subscriptions & quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 shadow-sm shadow-brand-500/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Aggregate KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total MRR */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Platform MRR</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{metrics.total_mrr_inr.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{metrics.total_paying_members}</span> paying merchants
            </div>
          </div>

          {/* Total Merchants */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Merchants</span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.total_merchants}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-brand-600 dark:text-brand-400">{metrics.paying_conversion_rate}%</span> paid conversion rate
            </div>
          </div>

          {/* Integration Rate */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Fully Integrated</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.integration_rate_percentage}%
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{metrics.fully_integrated_merchants}</span> of {metrics.total_merchants} live & firing
            </div>
          </div>

          {/* Verified Stores */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Websites</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.total_active_websites}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Verified storefront domains
            </div>
          </div>

          {/* Total Impressions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand-500/40 transition">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Global Impressions</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.total_impressions_served.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Urgency toasts displayed
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by merchant name, email, workspace, domain, or sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Integration Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Integration:</span>
              <select
                value={selectedIntegration}
                onChange={(e) => setSelectedIntegration(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="fully_integrated">Fully Integrated</option>
                <option value="widget_only">Widget Only</option>
                <option value="events_only">Webhooks Only</option>
                <option value="not_integrated">Not Integrated</option>
              </select>
            </div>

            {/* Plan Tier Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Plan:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free (₹0)</option>
                <option value="starter">Starter (₹499)</option>
                <option value="growth">Business Pro (₹1,499)</option>
                <option value="agency">Agency Scale (₹3,999)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results summary pill */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredMerchants.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{merchants.length}</strong> onboarded merchants
          </span>
          {(searchTerm || selectedIntegration !== 'all' || selectedTier !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIntegration('all');
                setSelectedTier('all');
                setSelectedStatus('all');
              }}
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Merchants Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Merchant & Workspace</th>
                <th className="py-3.5 px-4">Connected Store(s)</th>
                <th className="py-3.5 px-4">Integration Status</th>
                <th className="py-3.5 px-4">Membership & Billing</th>
                <th className="py-3.5 px-4">Monthly Quota</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                    Loading merchant registry...
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No merchants match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m) => {
                  return (
                    <tr
                      key={m.workspace_id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Merchant & Workspace */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
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
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {m.workspace_name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {m.full_name || 'Anonymous User'} • <span className="font-mono text-slate-600 dark:text-slate-300">{m.email}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Joined: {new Date(m.registered_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Storefront Websites */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {m.websites.map((site) => (
                            <div key={site.id} className="flex items-center gap-1.5 font-mono text-[11px]">
                              {site.is_verified ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <a
                                href={site.canonical_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group/link"
                              >
                                {site.domain}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition" />
                              </a>
                            </div>
                          ))}
                          {m.websites.length === 0 && (
                            <span className="text-slate-400 italic text-[11px]">No website registered</span>
                          )}
                        </div>
                      </td>

                      {/* Integration Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div>{renderIntegrationBadge(m.integration_status)}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${m.widget_installed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              Widget: {m.widget_installed ? 'Active & pinging' : 'No script ping'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${m.webhooks_connected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              Webhooks: {m.webhooks_connected ? `${m.total_events_ingested} verified events` : 'No events yet'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Membership & Billing */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {renderTierBadge(m.plan_tier)}
                            {renderStatusBadge(m.subscription_status)}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {m.mrr_inr > 0 ? `₹${m.mrr_inr.toLocaleString('en-IN')}/mo` : '₹0 (Free Plan)'}
                          </div>
                          {m.provider_subscription_id && (
                            <div className="text-[10px] font-mono text-slate-400">
                              Ref: {m.provider_subscription_id}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Monthly Quota */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 w-36">
                          <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            <span>{m.impressions_used.toLocaleString()}</span>
                            <span>{m.impressions_limit.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                m.quota_usage_percentage > 90
                                  ? 'bg-rose-500'
                                  : m.quota_usage_percentage > 70
                                  ? 'bg-amber-500'
                                  : 'bg-brand-500'
                              }`}
                              style={{ width: `${Math.min(100, m.quota_usage_percentage)}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {m.quota_usage_percentage}% consumed this month
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspect(m)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                            title="Deep Dive Audit"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openOverrideDialog(m)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition"
                            title="Override Membership"
                          >
                            Manage Plan
                          </button>

                          <button
                            onClick={() => handleSimulate(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Simulate Test Order Event"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Merchant Inspection Drawer / Modal */}
      {inspectMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {inspectMerchant.workspace_name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Workspace ID: {inspectMerchant.workspace_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectMerchant(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Key Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Integration</div>
                  <div className="mt-1">{renderIntegrationBadge(inspectMerchant.integration_status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Subscription</div>
                  <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    {renderTierBadge(inspectMerchant.plan_tier)}
                    {renderStatusBadge(inspectMerchant.subscription_status)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">MRR Contribution</div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                    {inspectMerchant.mrr_inr > 0 ? `₹${inspectMerchant.mrr_inr.toLocaleString('en-IN')}` : '₹0'}
                  </div>
                </div>
              </div>

              {/* Merchant Details Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Credentials</h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectMerchant.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{inspectMerchant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing Provider:</span>
                    <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{inspectMerchant.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription Ref:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{inspectMerchant.provider_subscription_id || 'None (Free Tier)'}</span>
                  </div>
                  {inspectMerchant.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Renewal Date:</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {new Date(inspectMerchant.current_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Websites Detailed Audit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Storefronts & Snippet Status ({inspectMerchant.websites.length})
                  </h3>
                  <button
                    onClick={() => handleSimulate(inspectMerchant)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <Zap className="w-3 h-3" /> Test Webhook Ping
                  </button>
                </div>

                {inspectMerchant.websites.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-brand-500" />
                        {w.domain}
                      </span>
                      {w.is_verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Domain Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Verification Pending
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <div>
                        <span>Last Widget Activity: </span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {w.last_widget_activity_at ? new Date(w.last_widget_activity_at).toLocaleTimeString() : 'Never'}
                        </strong>
                      </div>
                      <div>
                        <span>Last Event Ingested: </span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {w.last_event_at ? new Date(w.last_event_at).toLocaleTimeString() : 'Never'}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 mb-1">Storefront Embed Key</div>
                      <code className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 select-all overflow-x-auto">
                        {w.public_key}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Events Sample */}
              {detailedData && detailedData.websites_detailed.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Verified Ingestion Stream (Recent)
                  </h3>
                  {detailedData.websites_detailed.map((s: any) => (
                    <div key={s.id} className="space-y-2">
                      {s.recent_events && s.recent_events.length > 0 ? (
                        s.recent_events.map((ev: any) => (
                          <div
                            key={ev.id}
                            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {ev.normalized_payload?.first_name} from {ev.normalized_payload?.city || 'India'}
                              </span>{' '}
                              purchased <span className="italic">{ev.normalized_payload?.item_title}</span>
                            </div>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {ev.normalized_payload?.amount_formatted || '₹1,999'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-slate-400 italic text-[11px] text-center">
                          No order webhooks received yet for this store.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                onClick={() => setInspectMerchant(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Close Drawer
              </button>

              <button
                onClick={() => {
                  openOverrideDialog(inspectMerchant);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm shadow-brand-500/20 transition flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Adjust Subscription / VIP Comp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Subscription Override Modal */}
      {showOverrideModal && targetWorkspace && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Staff Subscription Adjustment
                </h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Merchant Workspace</label>
                <input
                  type="text"
                  disabled
                  value={targetWorkspace.workspace_name}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Target Membership Tier</label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value as PlanTier)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500"
                >
                  <option value="free">Free Starter (₹0/mo - 2,000 impressions)</option>
                  <option value="starter">Growth Starter (₹499/mo - 20,000 impressions)</option>
                  <option value="growth">Business Pro (₹1,499/mo - 100,000 impressions)</option>
                  <option value="agency">Agency Scale (₹3,999/mo - 500,000 impressions)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Subscription Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500"
                >
                  <option value="active">Active (Full access)</option>
                  <option value="past_due">Past Due (Payment retry required)</option>
                  <option value="canceled">Canceled (Downgraded to Free limits)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Operator Reason / Audit Note</label>
                <textarea
                  rows={2}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., VIP onboarding comp, enterprise POC, manual bank transfer..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
                >
                  {overrideSubmitting ? 'Updating...' : 'Save Plan Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
