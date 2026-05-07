import { create } from 'zustand';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface TenantState {
  currentTenantId: string | null;
  currentTenant: Organization | null;
  userTenants: any[];
  tenantRole: string | null;
  setTenantInfo: (tenantId: string, tenant: Organization, role: string) => void;
  setUserTenants: (tenants: any[]) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenantId: null,
  currentTenant: null,
  userTenants: [],
  tenantRole: null,
  setTenantInfo: (currentTenantId, currentTenant, tenantRole) => set({ currentTenantId, currentTenant, tenantRole }),
  setUserTenants: (userTenants) => set({ userTenants }),
  clearTenant: () => set({ currentTenantId: null, currentTenant: null, tenantRole: null, userTenants: [] })
}));
