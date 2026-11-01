import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  BellRing,
  Activity,
  BarChart3,
  CreditCard,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { CampaignPreviewModal } from './CampaignPreviewModal';
import { api } from '../lib/api';
import { Website, Workspace } from '@proofpulse/shared-types';

export const Layout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Array<Workspace & { role: string }>>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check system or saved dark mode
    if (localStorage.getItem('theme') === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    api.auth.getMe().then((res) => {
      setWorkspaces(res.data.workspaces);
      if (res.data.workspaces.length > 0) {
        setCurrentWorkspace(res.data.workspaces[0]);
        api.websites.list(res.data.workspaces[0].id).then((siteRes) => {
          setWebsites(siteRes.data);
          if (siteRes.data.length > 0) {
            setActiveWebsite(siteRes.data[0]);
          }
        });
      }
    }).catch(console.error);
  }, []);

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Websites & Install', to: '/dashboard/websites', icon: Globe },
    { name: 'Campaigns', to: '/dashboard/campaigns', icon: BellRing },
    { name: 'Live Event Feed', to: '/dashboard/events', icon: Activity },
    { name: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing & Quotas', to: '/dashboard/billing', icon: CreditCard },
    { name: 'Integration Docs', to: '/dashboard/docs', icon: BookOpen },
    { name: 'Workspace Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-brand-600 dark:from-white dark:via-brand-200 dark:to-brand-400 bg-clip-text text-transparent">
                ProofPulse
              </span>
              <span className="hidden xs:inline-block sm:inline-block ml-1.5 sm:ml-2 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded border border-brand-200 dark:border-brand-800">
                PRO
              </span>
            </div>
          </NavLink>

          {/* Workspace Switcher */}
          {currentWorkspace && (
            <div className="hidden md:flex items-center gap-1.5 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 hidden lg:inline">Workspace:</span>
              <button className="font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 max-w-[140px] truncate">
                <span className="truncate">{currentWorkspace.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Active Store Selector */}
          {activeWebsite && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs max-w-[160px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{activeWebsite.domain}</span>
            </div>
          )}

          {/* Staff / Ops Console Direct Link */}
          <NavLink
            to="/internal"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Switch to Internal Staff Operations Console"
          >
            <span>Ops Console</span>
            <span className="text-[10px] text-slate-400">↗</span>
          </NavLink>

          {/* Product Home Link */}
          <NavLink
            to="/"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </NavLink>

          {/* Live Preview Button */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 transition"
            title="Open Live Preview Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">Preview Studio</span>
            <span className="xs:hidden sm:hidden">Studio</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Avatar */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            AP
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Storefront Verification Pill */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Widget Status</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Serving real-time verified purchase & urgency alerts.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 sm:w-80 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">ProofPulse</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Workspace & Website Status in Mobile Menu */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  {currentWorkspace && (
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Workspace</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{currentWorkspace.name}</span>
                    </div>
                  )}
                  {activeWebsite && (
                    <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Active Store</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[150px]">
                        {activeWebsite.domain}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nav Links */}
                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Navigation
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {item.name}
                      </NavLink>
                    );
                  })}
                </div>

                {/* Mobile Secondary Shortcuts */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Portals
                  </div>
                  <NavLink
                    to="/internal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      Staff Ops Console
                    </span>
                    <span className="text-slate-400">↗</span>
                  </NavLink>
                  <NavLink
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                    Product Marketing Home
                  </NavLink>
                </div>
              </div>

              {/* Widget Status Pill in Mobile Menu */}
              <div className="mt-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Widget Status</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Route Outlet */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ activeWebsite, currentWorkspace }} />
          </div>
        </main>
      </div>

      {/* Global Preview Modal */}
      <CampaignPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};
