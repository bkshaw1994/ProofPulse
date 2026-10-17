import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Play,
  Pause,
  Trash2,
  Eye,
  Clock,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import {
  Campaign,
  Website,
  NotificationType,
  CampaignPosition,
  CampaignTheme
} from '@proofpulse/shared-types';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('recent_purchase');
  const [position, setPosition] = useState<CampaignPosition>('bottom_left');
  const [theme, setTheme] = useState<CampaignTheme>('light');
  const [durationSeconds, setDurationSeconds] = useState(6);
  const [initialDelaySeconds, setInitialDelaySeconds] = useState(3);
  const [countdownDeadline, setCountdownDeadline] = useState('');
  const [stockThreshold, setStockThreshold] = useState(5);

  const fetchCampaigns = (websiteId: string) => {
    setLoading(true);
    api.campaigns.list(websiteId)
      .then((res) => setCampaigns(res.data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.websites.list().then((res) => {
      setWebsites(res.data);
      if (res.data.length > 0) {
        setSelectedWebsiteId(res.data[0].id);
        fetchCampaigns(res.data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleToggleStatus = async (c: Campaign) => {
    try {
      if (c.status === 'active') {
        await api.campaigns.pause(c.id);
      } else {
        await api.campaigns.activate(c.id);
      }
      fetchCampaigns(selectedWebsiteId);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.campaigns.delete(id);
      fetchCampaigns(selectedWebsiteId);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await api.campaigns.create(selectedWebsiteId, {
        name,
        notification_type: notificationType,
        position,
        theme,
        duration_seconds: Number(durationSeconds),
        initial_delay_seconds: Number(initialDelaySeconds),
        config: {
          countdown_end_time: notificationType === 'genuine_countdown' ? countdownDeadline : undefined,
          stock_threshold: notificationType === 'low_stock' ? Number(stockThreshold) : undefined
        }
      });
      setCreateModalOpen(false);
      setName('');
      fetchCampaigns(selectedWebsiteId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notification Campaigns
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and deploy verified social proof, live visitor meters, and genuine countdown alerts.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateModalOpen(true);
            setErrorMsg('');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Website Filter Tabs */}
      {websites.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {websites.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWebsiteId(w.id);
                fetchCampaigns(w.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedWebsiteId === w.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {w.domain}
            </button>
          ))}
        </div>
      )}

      {/* Campaign List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3 bg-white dark:bg-slate-900">
          <BellRing className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white">No campaigns found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first verified purchase or urgency campaign to engage shoppers.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      {c.notification_type.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{c.name}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Position:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {c.position.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Theme:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {c.theme}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Display Time:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {c.duration_seconds} seconds
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Initial Delay:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {c.initial_delay_seconds}s after load
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setPreviewCampaign(c);
                    setPreviewModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Card
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      c.status === 'active'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {c.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Configure New Notification Campaign
              </h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Fest Verified Purchases"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="recent_purchase">🛍️ Recent Verified Purchase</option>
                    <option value="recent_signup">🎉 Recent Verified Signup</option>
                    <option value="live_visitors">👀 Live Visitors Count</option>
                    <option value="low_stock">🔥 Low Stock Warning</option>
                    <option value="genuine_countdown">⏳ Genuine Countdown Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Screen Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as CampaignPosition)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  >
                    <option value="bottom_left">Bottom Left</option>
                    <option value="bottom_right">Bottom Right</option>
                    <option value="top_left">Top Left</option>
                    <option value="top_right">Top Right</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as CampaignTheme)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="minimal">Minimal</option>
                    <option value="glassmorphic">Glassmorphic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Seconds
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Delay (s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={initialDelaySeconds}
                    onChange={(e) => setInitialDelaySeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              {notificationType === 'genuine_countdown' && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    Genuine Expiration Deadline (Mandatory)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={countdownDeadline}
                    onChange={(e) => setCountdownDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white dark:bg-slate-900 text-xs"
                  />
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 block">
                    ProofPulse prohibits fake or auto-resetting countdown timers. The deadline must be an immutable target timestamp.
                  </span>
                </div>
              )}

              {notificationType === 'low_stock' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Alert Threshold (Alert triggers when units ≤ threshold)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal for Specific Campaign */}
      {previewCampaign && (
        <CampaignPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          initialType={previewCampaign.notification_type}
          initialPosition={previewCampaign.position}
          initialTheme={previewCampaign.theme}
        />
      )}
    </div>
  );
};
