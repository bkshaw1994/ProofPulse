import React, { useState } from 'react';
import {
  NotificationType,
  CampaignPosition,
  CampaignTheme
} from '@proofpulse/shared-types';
import { CheckCircle2, X, Eye, Sparkles } from 'lucide-react';

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: NotificationType;
  initialPosition?: CampaignPosition;
  initialTheme?: CampaignTheme;
}

export const CampaignPreviewModal: React.FC<PreviewProps> = ({
  isOpen,
  onClose,
  initialType = 'recent_purchase',
  initialPosition = 'bottom_left',
  initialTheme = 'light'
}) => {
  const [notificationType, setNotificationType] = useState<NotificationType>(initialType);
  const [position, setPosition] = useState<CampaignPosition>(initialPosition);
  const [theme, setTheme] = useState<CampaignTheme>(initialTheme);
  const [customerName, setCustomerName] = useState('Pooja');
  const [customerCity, setCustomerCity] = useState('Bengaluru');
  const [productTitle, setProductTitle] = useState('Organic Kashmiri Saffron (2g)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 p-6 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Live Preview Studio
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Notification Type
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="recent_purchase">🛍️ Recent Purchase</option>
              <option value="recent_signup">🎉 Recent Signup</option>
              <option value="live_visitors">👀 Live Visitors</option>
              <option value="low_stock">🔥 Low Stock Alert</option>
              <option value="genuine_countdown">⏳ Genuine Countdown</option>
            </select>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Screen Position
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['bottom_left', 'bottom_right', 'top_left', 'top_right'] as CampaignPosition[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-2 rounded-lg font-medium border text-center transition ${
                    position === pos
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {pos.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['light', 'dark', 'minimal', 'glassmorphic'] as CampaignTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setTheme(thm)}
                  className={`px-3 py-2 rounded-lg font-medium border text-center transition capitalize ${
                    theme === thm
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Data Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                City
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Mock Storefront Canvas */}
        <div className="flex-1 p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-300/60 dark:border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="ml-2 font-mono text-slate-500">https://yourstore.in/products/silk-saree</span>
            </div>
            <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
              <Eye className="w-3.5 h-3.5" /> Live Storefront Simulator
            </span>
          </div>

          {/* Mock Storefront Body Content */}
          <div className="my-auto max-w-md mx-auto text-center space-y-3 opacity-60">
            <div className="h-6 w-48 bg-slate-300 dark:bg-slate-800 rounded mx-auto"></div>
            <div className="h-3 w-64 bg-slate-300 dark:bg-slate-800 rounded mx-auto"></div>
            <div className="h-32 w-full bg-slate-300 dark:bg-slate-800 rounded-xl mx-auto mt-4"></div>
          </div>

          {/* The ProofPulse Social Proof Card Rendered in Selected Position */}
          <div
            className={`absolute transition-all duration-300 z-10 ${
              position === 'bottom_left' ? 'bottom-6 left-6' :
              position === 'bottom_right' ? 'bottom-6 right-6' :
              position === 'top_left' ? 'top-16 left-6' : 'top-16 right-6'
            }`}
          >
            <div
              className={`flex items-center gap-3.5 p-3.5 rounded-xl max-w-[340px] shadow-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white border-slate-700 shadow-slate-950/50'
                  : theme === 'glassmorphic'
                  ? 'bg-white/80 backdrop-blur-md text-slate-900 border-white/40 shadow-slate-900/10'
                  : theme === 'minimal'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-white text-slate-900 border-slate-200/80 shadow-slate-900/10'
              }`}
            >
              {/* Card Icon or Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl flex-shrink-0">
                {notificationType === 'recent_purchase' && '🛍️'}
                {notificationType === 'recent_signup' && '🎉'}
                {notificationType === 'live_visitors' && '👀'}
                {notificationType === 'low_stock' && '🔥'}
                {notificationType === 'genuine_countdown' && '⏳'}
              </div>

              {/* Card Text Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-xs font-bold truncate">
                  {notificationType === 'recent_purchase' && `${customerName} in ${customerCity}`}
                  {notificationType === 'recent_signup' && `${customerName} from ${customerCity}`}
                  {notificationType === 'live_visitors' && '18 people viewing right now'}
                  {notificationType === 'low_stock' && 'Only 3 items left in stock!'}
                  {notificationType === 'genuine_countdown' && 'Diwali Festive Sale'}
                </div>
                <div className="text-[11.5px] opacity-80 truncate mt-0.5">
                  {notificationType === 'recent_purchase' && `Purchased ${productTitle}`}
                  {notificationType === 'recent_signup' && 'Subscribed to VIP club'}
                  {notificationType === 'live_visitors' && 'Real-time verified store activity'}
                  {notificationType === 'low_stock' && `${productTitle} is selling fast`}
                  {notificationType === 'genuine_countdown' && 'Offer ends in 04h 32m 10s'}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified by ProofPulse</span>
                  <span className="opacity-40">• 4m ago</span>
                </div>
              </div>

              {/* Close Icon */}
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
