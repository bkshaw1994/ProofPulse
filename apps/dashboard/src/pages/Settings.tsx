import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Key,
  CheckCircle2,
  Lock,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';
import { Workspace, UserProfile } from '@proofpulse/shared-types';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    api.auth.getMe().then((res) => {
      setUser(res.data.user);
      if (res.data.workspaces.length > 0) {
        setWorkspace(res.data.workspaces[0]);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600" />
          Workspace & Security Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tenant isolation, membership access controls, and Indian DPDP Act privacy governance.
        </p>
      </div>

      {/* Workspace Details */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-600" />
          Active Workspace
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Workspace Name</label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-900 dark:text-white">
              {workspace?.name || 'Patel E-Commerce Group'}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Canonical Workspace Slug</label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-600 dark:text-slate-400">
              {workspace?.slug || 'patel-ecommerce'}
            </div>
          </div>
        </div>
      </div>

      {/* User Identity */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" />
          Authenticated Admin Account
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-900 dark:text-white">
              {user?.full_name || 'Aarav Patel'}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white">
              {user?.email || 'demo@proofpulse.in'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Compliance (DPDP Act Ready) */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Indian DPDP Act & Privacy Controls
          </h2>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Compliant
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Strict Data Minimization:</span>
              ProofPulse strips all phone numbers, physical street addresses, and full customer names before database persistence. Only first names and city levels are retained.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Automated Freshness Expiry:</span>
              All raw event records expire and are excluded from visitor notifications after your plan's freshness window (48-72 hours).
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Cryptographic Webhook Verification:</span>
              Shopify and Razorpay events are validated with HMAC-SHA256 signatures before being queued.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
