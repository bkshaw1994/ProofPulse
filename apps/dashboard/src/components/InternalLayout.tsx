import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Activity,
  ShieldCheck,
  Terminal,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  Server,
  Database,
  Radio,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { api } from '../lib/api';
import { AdminMetricsSummary } from '@proofpulse/shared-types';

export const InternalLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetricsSummary | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchQuickMetrics = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.admin.getMetrics();
      setMetrics(res.data);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch admin metrics in InternalLayout:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuickMetrics();
  }, []);

  const navItems = [
    { name: 'Merchant & Membership Registry', to: '/internal', icon: Users, exact: true },
    { name: 'Revenue & Subscription Ops', to: '/internal/subscriptions', icon: CreditCard },
    { name: 'Store Integrations & Webhooks', to: '/internal/integrations', icon: Activity },
    { name: 'Platform Telemetry & Health', to: '/internal/telemetry', icon: Radio },
    { name: 'Security & Audit Trail', to: '/internal/audit', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Security & Ticker Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE BACK-OFFICE
          </span>
          <span className="hidden sm:inline-block text-slate-500">|</span>
          <span className="hidden sm:inline-block">CLUSTER: PROD-IN-MUM-1</span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:inline-block">GATEWAY: PORT 4000 (HEALTHY)</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            SYNC: <strong className="text-slate-200">{lastRefreshed}</strong>
          </span>
          <button
            onClick={fetchQuickMetrics}
            disabled={isRefreshing}
            className="hover:text-white flex items-center gap-1 transition"
            title="Refresh Platform Telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
            <span>SYNC</span>
          </button>
          <span className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
            RESTRICTED ACCESS
          </span>
        </div>
      </div>

      {/* Main Internal Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Distinct Ops Logo */}
          <NavLink to="/internal" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white font-mono">
                  PROOFPULSE<span className="text-rose-500 font-sans">.OPS</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">
                  COMMAND CENTER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Merchant Operations & Subscription Telemetry
              </p>
            </div>
          </NavLink>
        </div>

        {/* Global Key Metrics Ticker in Header */}
        {metrics && (
          <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Platform MRR</span>
              <strong className="text-emerald-400 font-bold">
                ₹{metrics.total_mrr_inr.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Merchants</span>
              <strong className="text-white">
                {metrics.total_merchants} <span className="text-brand-400 text-[10px]">({metrics.total_paying_members} paid)</span>
              </strong>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Integration</span>
              <strong className="text-indigo-400">
                {metrics.integration_rate_percentage}%
              </strong>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Impressions</span>
              <strong className="text-amber-400 font-bold">
                {metrics.total_impressions_served.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Switch to Merchant Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition group"
            title="Switch from Back-Office Ops to Merchant View"
          >
            <span>Merchant App</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Interactive API Docs Link */}
          <a
            href="http://localhost:4000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Staff Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-xs font-mono">
              OP
            </div>
            <div className="hidden lg:block text-left font-mono">
              <div className="text-xs font-bold text-slate-200 leading-tight">Admin Staff</div>
              <div className="text-[10px] text-rose-400">Superuser</div>
            </div>
          </div>
        </div>
      </header>

      {/* Internal Workspace Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Ops Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 p-4 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                OPERATIONS CONSOLE
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to || location.pathname === '/internal/merchants'
                    : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20 border border-rose-500/30'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Quick Links Section */}
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                DEVELOPER & ADMIN TOOLS
              </div>
              <div className="space-y-1 text-xs">
                <a
                  href="http://localhost:4000/health"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    API Health Status
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>

                <a
                  href="http://localhost:4000/api/v1/admin/merchants"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    Raw JSON Feed
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>

                <a
                  href="http://localhost:4000/widget/proofpulse.js"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    CDN Embed Bundle
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Operator Node Badge in Sidebar Footer */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>SECURITY LEVEL</span>
              <span className="text-rose-400 font-bold">LEVEL-4</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed">
              Internal back-office interface. All tenant modifications, plan comp actions, and queries are audit-logged.
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/80 backdrop-blur-md">
            <div className="w-72 bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-white font-mono text-sm">OPS CONSOLE MENU</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <item.icon className="w-4 h-4 text-slate-400" />
                      {item.name}
                    </NavLink>
                  ))}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-4 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-900"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Switch to Merchant App
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
