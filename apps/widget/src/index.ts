import {
  PublicNotificationItem,
  PublicWidgetConfig,
  PublicWidgetCampaign
} from '@proofpulse/shared-types';

(function () {
  'use strict';

  // Prevent multiple initializations on host page
  if ((window as any).__ProofPulseInitialized) {
    return;
  }
  (window as any).__ProofPulseInitialized = true;

  // Extract configuration from current script tag
  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-website-id]') ||
    document.querySelector('script[src*="proofpulse.js"]');

  const websiteId =
    currentScript?.getAttribute('data-website-id') ||
    (window as any).PROOFPULSE_WEBSITE_ID;

  const apiBase =
    currentScript?.getAttribute('data-api-url') ||
    (window as any).PROOFPULSE_API_URL ||
    'http://localhost:4000/api/v1';

  if (!websiteId) {
    console.warn('[ProofPulse] Missing data-website-id on script embed tag.');
    return;
  }

  // Session storage helpers for frequency control & visitor hash
  function getVisitorId(): string {
    let vid = localStorage.getItem('_pp_vid');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('_pp_vid', vid);
    }
    return vid;
  }

  const visitorId = getVisitorId();

  // Shadow DOM host setup for complete CSS isolation
  const container = document.createElement('div');
  container.id = 'proofpulse-widget-root';
  container.style.position = 'fixed';
  container.style.zIndex = '2147483647';
  container.style.pointerEvents = 'none'; // Clicks pass through empty regions
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'closed' });

  // CSS Styles inside Shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .pp-wrapper {
      position: fixed;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 380px;
      width: calc(100vw - 32px);
    }

    .pos-bottom_left { bottom: 20px; left: 20px; }
    .pos-bottom_right { bottom: 20px; right: 20px; }
    .pos-top_left { top: 20px; left: 20px; }
    .pos-top_right { top: 20px; right: 20px; }

    .pp-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      opacity: 0;
      transform: translateY(12px) scale(0.96);
      transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: #ffffff;
      color: #0f172a;
    }

    .pp-card.pp-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Themes */
    .theme-light {
      background: #ffffff;
      color: #0f172a;
      border-color: #e2e8f0;
    }
    .theme-dark {
      background: #0f172a;
      color: #f8fafc;
      border-color: #334155;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .theme-glassmorphic {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-color: rgba(255, 255, 255, 0.3);
      color: #0f172a;
    }
    .theme-minimal {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .pp-image-wrap {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pp-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .pp-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #eef2ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .theme-dark .pp-icon-badge {
      background: #312e81;
      color: #a5b4fc;
    }

    .pp-content {
      flex: 1;
      min-width: 0;
    }

    .pp-title {
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pp-message {
      font-size: 12px;
      opacity: 0.82;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .pp-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.65;
    }

    .pp-verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #059669;
      font-weight: 500;
    }

    .theme-dark .pp-verified-badge {
      color: #34d399;
    }

    .pp-close-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: currentColor;
      opacity: 0.4;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: opacity 0.15s, background 0.15s;
    }

    .pp-close-btn:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.06);
    }
    .theme-dark .pp-close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .pp-brand {
      font-size: 9.5px;
      opacity: 0.45;
      text-align: right;
      margin-top: 3px;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    @media (max-width: 480px) {
      .pp-wrapper {
        max-width: calc(100vw - 24px);
      }
      .pos-bottom_left, .pos-bottom_right {
        bottom: 12px;
        left: 12px;
        right: 12px;
      }
    }
  `;
  shadow.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.className = 'pp-wrapper pos-bottom_left';
  shadow.appendChild(wrapper);

  // Telemetry dispatch
  async function trackEvent(eventType: 'impression' | 'click' | 'dismissal', campaignId?: string, eventId?: string) {
    try {
      fetch(`${apiBase}/widget/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: websiteId,
          campaign_id: campaignId,
          event_id: eventId,
          event_type: eventType,
          visitor_id_hash: visitorId,
          page_url: window.location.href
        }),
        keepalive: true
      }).catch(() => {});
    } catch {
      // Graceful silence
    }
  }

  // Widget Core State
  let config: PublicWidgetConfig | null = null;
  let notifications: PublicNotificationItem[] = [];
  let currentIndex = 0;
  let activeTimeout: any = null;

  async function init() {
    try {
      // 1. Fetch public config
      const cfgRes = await fetch(`${apiBase}/widget/config?website_id=${encodeURIComponent(websiteId)}`);
      if (!cfgRes.ok) return;
      config = await cfgRes.json();

      if (!config || !config.campaigns || config.campaigns.length === 0) {
        return;
      }

      // Set position from first active campaign
      const mainCampaign = config.campaigns[0];
      wrapper.className = `pp-wrapper pos-${mainCampaign.position || 'bottom_left'}`;

      // 2. Fetch eligible verified notifications
      const evtRes = await fetch(`${apiBase}/widget/events?website_id=${encodeURIComponent(websiteId)}`);
      if (!evtRes.ok) return;
      const evtData = await evtRes.json();
      notifications = evtData.notifications || [];

      if (notifications.length === 0) return;

      // 3. Begin display loop with initial delay
      const initialDelayMs = (mainCampaign.initial_delay_seconds || 3) * 1000;
      activeTimeout = setTimeout(showNextNotification, initialDelayMs);
    } catch {
      // Fail silently to never disturb host website
    }
  }

  function showNextNotification() {
    if (!notifications || notifications.length === 0) return;

    const item = notifications[currentIndex];
    currentIndex = (currentIndex + 1) % notifications.length;

    // Find corresponding campaign
    const campaign = config?.campaigns.find((c) => c.id === item.campaign_id) || config?.campaigns[0];
    const themeClass = `theme-${campaign?.theme || 'light'}`;
    const durationMs = (campaign?.duration_seconds || 6) * 1000;
    const intervalMs = (campaign?.display_frequency_minutes || 0.1) * 60 * 1000;

    wrapper.innerHTML = '';

    const card = document.createElement('div');
    card.className = `pp-card ${themeClass}`;
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    card.tabIndex = 0;

    // Visual Icon / Image
    let visualHtml = '';
    if (item.image_url) {
      visualHtml = `
        <div class="pp-image-wrap">
          <img src="${item.image_url}" alt="${item.title}" class="pp-image" />
        </div>
      `;
    } else {
      let icon = '⚡';
      if (item.notification_type === 'recent_purchase') icon = '🛍️';
      if (item.notification_type === 'recent_signup') icon = '🎉';
      if (item.notification_type === 'live_visitors') icon = '👀';
      if (item.notification_type === 'low_stock') icon = '🔥';
      if (item.notification_type === 'genuine_countdown') icon = '⏳';

      visualHtml = `
        <div class="pp-icon-badge">${icon}</div>
      `;
    }

    card.innerHTML = `
      ${visualHtml}
      <div class="pp-content">
        <div class="pp-title">${item.title}</div>
        <div class="pp-message">${item.message}</div>
        <div class="pp-footer">
          <span>${item.timestamp_formatted}</span>
          ${
            item.verified
              ? `<span class="pp-verified-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Verified
                </span>`
              : ''
          }
        </div>
      </div>
      <button class="pp-close-btn" aria-label="Dismiss notification">&times;</button>
    `;

    // Click on card
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('pp-close-btn')) return;
      trackEvent('click', item.campaign_id, item.id);
      if (item.target_url) {
        window.location.href = item.target_url;
      }
    });

    // Dismiss button
    const closeBtn = card.querySelector('.pp-close-btn');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('pp-visible');
      trackEvent('dismissal', item.campaign_id, item.id);
      clearTimeout(activeTimeout);
      activeTimeout = setTimeout(showNextNotification, intervalMs);
    });

    // Keyboard accessibility: ESC dismisses card
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        card.classList.remove('pp-visible');
      }
    });

    wrapper.appendChild(card);

    // Trigger smooth entrance animation
    requestAnimationFrame(() => {
      card.classList.add('pp-visible');
      trackEvent('impression', item.campaign_id, item.id);
    });

    // Schedule exit
    activeTimeout = setTimeout(() => {
      card.classList.remove('pp-visible');
      activeTimeout = setTimeout(showNextNotification, intervalMs);
    }, durationMs);
  }

  // Bootstrap when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
