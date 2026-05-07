import { useTenantStore } from '../store/useTenantStore';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const tenantId = useTenantStore.getState().currentTenantId;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };

  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}
