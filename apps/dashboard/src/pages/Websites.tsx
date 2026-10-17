import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Key,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { Website } from '@proofpulse/shared-types';

export const Websites: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{ site: Website; apiKey: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchWebsites = () => {
    setLoading(true);
    api.websites.list()
      .then((res) => setWebsites(res.data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await api.websites.create(newDomain);
      setCreatedCredentials({
        site: res.data,
        apiKey: res.data.private_api_key || 'pp_sec_...'
      });
      setNewDomain('');
      fetchWebsites();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add website');
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.websites.verify(id);
      fetchWebsites();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this website? All campaigns will be disabled.')) return;
    try {
      await api.websites.delete(id);
      fetchWebsites();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Registered Websites & Stores
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your connected storefronts, domain verification tokens, and install scripts.
          </p>
        </div>

        <button
          onClick={() => {
            setAddModalOpen(true);
            setCreatedCredentials(null);
            setErrorMsg('');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Website</span>
        </button>
      </div>

      {/* Website Cards */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading websites...</div>
      ) : websites.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3 bg-white dark:bg-slate-900">
          <Globe className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white">No websites registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your Shopify, WooCommerce, or custom e-commerce store to begin serving verified social proof.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {websites.map((site) => (
            <div
              key={site.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{site.domain}</h3>
                      <span className="text-xs text-slate-400 font-mono">{site.canonical_url}</span>
                    </div>
                  </div>

                  {site.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerify(site.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Verify Now
                    </button>
                  )}
                </div>

                {/* Key Identifiers */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Public Identifier:</span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-900 dark:text-slate-200">
                      {site.public_key}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Verification Challenge:</span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-900 dark:text-slate-200">
                      {site.verification_token}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`/campaigns?websiteId=${site.id}`}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                >
                  Manage Campaigns <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleDelete(site.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  title="Delete Website"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Website Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-600" />
              Register New Storefront Domain
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 text-xs border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!createdCredentials ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Store Domain (e.g., mystore.com or shop.in)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mystore.in"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Protocol prefixes (https://) and path routes will be automatically stripped.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
                  >
                    Register Store
                  </button>
                </div>
              </form>
            ) : (
              /* Success & Private Key Reveal Screen */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 text-xs border border-emerald-200 dark:border-emerald-800">
                  Store domain registered successfully! Save your private ingestion key now.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-brand-600" />
                    Private Ingestion API Key (Shown only once)
                  </label>
                  <div className="relative font-mono text-xs bg-slate-950 text-slate-200 p-3 rounded-xl border border-slate-800 break-all">
                    {createdCredentials.apiKey}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.apiKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    Never share this key with visitors or bundle it in storefront scripts.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setAddModalOpen(false);
                      setCreatedCredentials(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white"
                  >
                    I Have Saved My Secret Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
