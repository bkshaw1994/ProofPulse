import {
  UserProfile,
  Workspace,
  Website,
  Campaign,
  EventRecord,
  AnalyticsSummaryResponse,
  UsageSummaryResponse,
  Subscription,
  PlanTier,
  AdminMerchantOverview,
  AdminMetricsSummary
} from '@proofpulse/shared-types';
import { PlanConfig } from '@proofpulse/config';

const API_BASE = '/api/v1';

// Default test token for local development
let authToken: string = 'mock_user_00000000-0000-0000-0000-000000000001';

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken(): string {
  return authToken;
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  auth: {
    getMe: () => fetchJson<{ data: { user: UserProfile; workspaces: Array<Workspace & { role: string }> } }>('/me')
  },
  websites: {
    list: (workspaceId?: string) =>
      fetchJson<{ data: Website[] }>(workspaceId ? `/websites?workspace_id=${workspaceId}` : '/websites'),
    get: (id: string) => fetchJson<{ data: Website }>(`/websites/${id}`),
    create: (domain: string, workspaceId?: string) =>
      fetchJson<{ data: Website & { private_api_key?: string } }>('/websites', {
        method: 'POST',
        body: JSON.stringify({ domain, workspace_id: workspaceId })
      }),
    update: (id: string, data: { domain?: string }) =>
      fetchJson<{ data: Website }>(`/websites/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      fetchJson<void>(`/websites/${id}`, {
        method: 'DELETE'
      }),
    verify: (id: string) =>
      fetchJson<{ data: { is_verified: boolean; verified_at: string } }>(`/websites/${id}/verify`, {
        method: 'POST'
      })
  },
  campaigns: {
    list: (websiteId: string) =>
      fetchJson<{ data: Campaign[] }>(`/websites/${websiteId}/campaigns`),
    get: (id: string) =>
      fetchJson<{ data: Campaign }>(`/campaigns/${id}`),
    create: (websiteId: string, data: Partial<Campaign>) =>
      fetchJson<{ data: Campaign }>(`/websites/${websiteId}/campaigns`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<Campaign>) =>
      fetchJson<{ data: Campaign }>(`/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      fetchJson<void>(`/campaigns/${id}`, {
        method: 'DELETE'
      }),
    activate: (id: string) =>
      fetchJson<{ data: Campaign }>(`/campaigns/${id}/activate`, {
        method: 'POST'
      }),
    pause: (id: string) =>
      fetchJson<{ data: Campaign }>(`/campaigns/${id}/pause`, {
        method: 'POST'
      })
  },
  events: {
    list: (websiteId: string, limit = 50) =>
      fetchJson<{ data: EventRecord[] }>(`/websites/${websiteId}/events?limit=${limit}`)
  },
  analytics: {
    get: (websiteId: string, from?: string, to?: string) => {
      const q = new URLSearchParams();
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      return fetchJson<{ data: AnalyticsSummaryResponse }>(`/websites/${websiteId}/analytics?${q.toString()}`);
    },
    getUsage: (websiteId: string) =>
      fetchJson<{ data: UsageSummaryResponse }>(`/websites/${websiteId}/usage`)
  },
  billing: {
    getSubscription: (workspaceId?: string) =>
      fetchJson<{ data: { subscription: Subscription; plan: PlanConfig } }>(
        workspaceId ? `/billing/subscription?workspace_id=${workspaceId}` : '/billing/subscription'
      ),
    getPlans: () => fetchJson<{ data: PlanConfig[] }>('/billing/plans'),
    upgrade: (planTier: PlanTier, workspaceId?: string) =>
      fetchJson<{ data: { subscription: Subscription; plan: PlanConfig } }>('/billing/upgrade', {
        method: 'POST',
        body: JSON.stringify({ plan_tier: planTier, workspace_id: workspaceId })
      })
  },
  admin: {
    getMetrics: () => fetchJson<{ data: AdminMetricsSummary }>('/admin/metrics'),
    listMerchants: (params?: {
      search?: string;
      integration_status?: string;
      plan_tier?: string;
      subscription_status?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.integration_status) q.append('integration_status', params.integration_status);
      if (params?.plan_tier) q.append('plan_tier', params.plan_tier);
      if (params?.subscription_status) q.append('subscription_status', params.subscription_status);
      return fetchJson<{ data: AdminMerchantOverview[]; meta: { total: number } }>(`/admin/merchants?${q.toString()}`);
    },
    getMerchant: (workspaceId: string) =>
      fetchJson<{ data: AdminMerchantOverview & { websites_detailed: any[]; audit_logs: any[] } }>(
        `/admin/merchants/${workspaceId}`
      ),
    updateSubscription: (
      workspaceId: string,
      data: { plan_tier: PlanTier; status?: string; reason?: string }
    ) =>
      fetchJson<{ data: any; message: string }>(`/admin/merchants/${workspaceId}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    simulateEvent: (workspaceId: string) =>
      fetchJson<{ data: any; message: string }>(`/admin/merchants/${workspaceId}/simulate-event`, {
        method: 'POST'
      })
  }
};
