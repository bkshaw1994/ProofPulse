import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Filter,
  Plus,
  Send,
  Code,
  ShoppingBag,
  UserCheck,
  PackageCheck
} from 'lucide-react';
import { api } from '../lib/api';
import { EventRecord, Website, EventType } from '@proofpulse/shared-types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Test Event Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('Rahul');
  const [city, setCity] = useState('Hyderabad');
  const [itemTitle, setItemTitle] = useState('Hand-loomed Cotton Kurta');
  const [amount, setAmount] = useState(1299);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = (websiteId: string) => {
    setLoading(true);
    api.events.list(websiteId, 100)
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.websites.list().then((res) => {
      setWebsites(res.data);
      if (res.data.length > 0) {
        setSelectedWebsiteId(res.data[0].id);
        fetchEvents(res.data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleSendTestEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mock_user_00000000-0000-0000-0000-000000000001`
        },
        body: JSON.stringify({
          website_id: selectedWebsiteId,
          event_type: 'purchase',
          source_event_id: `test_manual_${Date.now()}`,
          occurred_at: new Date().toISOString(),
          payload: {
            first_name: firstName,
            city,
            item_title: itemTitle,
            amount: Number(amount)
          }
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Submission failed');
      }

      setTestModalOpen(false);
      fetchEvents(selectedWebsiteId);
    } catch (err: any) {
      alert(`Error submitting test event: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.event_type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-600" />
            Verified Event Stream
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of server-side verified customer orders, signups, and catalog stock updates.
          </p>
        </div>

        <button
          onClick={() => setTestModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition"
        >
          <Send className="w-4 h-4" />
          <span>Send Test Purchase Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Filter Event Type:</span>
          {['all', 'purchase', 'signup', 'inventory_update'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg font-medium transition capitalize ${
                filterType === type
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-slate-400">
          Showing {filteredEvents.length} verified events
        </span>
      </div>

      {/* Event Records Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading verified events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3 bg-white dark:bg-slate-900">
          <Activity className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white">No events recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the "Send Test Purchase Event" button or trigger orders in your Shopify store to see live events.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const p = evt.normalized_payload as any;
            const isExpanded = expandedEventId === evt.id;
            return (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                      {evt.event_type === 'purchase' && '🛍️'}
                      {evt.event_type === 'signup' && '🎉'}
                      {evt.event_type === 'inventory_update' && '📦'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.first_name ? `${p.first_name} in ${p.city || 'India'}` : p.item_title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {evt.event_type === 'purchase' && `Bought ${p.item_title} ${p.amount_formatted ? `(${p.amount_formatted})` : ''}`}
                        {evt.event_type === 'signup' && (p.action_label || 'Registered new account')}
                        {evt.event_type === 'inventory_update' && `Stock changed to ${p.items_left} remaining`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {new Date(evt.occurred_at).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 ml-auto"
                    >
                      <Code className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="rounded-xl bg-slate-950 text-slate-200 p-3 font-mono text-xs overflow-x-auto border border-slate-800">
                      <pre>{JSON.stringify(evt, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Test Event Dispatch Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-600" />
              Simulate Verified Purchase Event
            </h3>

            <p className="text-xs text-slate-500">
              Dispatches an authentic signed purchase event to the ingestion pipeline. Eligible active campaigns will immediately queue this notification for storefront visitors.
            </p>

            <form onSubmit={handleSendTestEvent} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City (Indian Metro or Region)
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchased Product Title
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Order Amount (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20"
                >
                  {submitting ? 'Ingesting...' : 'Ingest Verified Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
