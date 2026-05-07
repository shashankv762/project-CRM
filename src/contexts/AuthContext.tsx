import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore } from '../store/useTenantStore';

interface AuthContextType {
  logOut: () => Promise<void>;
  user: any; // mapping to old firebase user for backwards compatibility during transition
}

const AuthContext = createContext<AuthContextType>({ logOut: async () => {}, user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading, logout: zustandLogout } = useAuthStore();
  const { setUserTenants, setTenantInfo } = useTenantStore();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      console.log('checkAuth started');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const res = await fetch('/api/auth/me', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        console.log('checkAuth fetch complete, ok:', res.ok);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            useAuthStore.getState().setUser(data.user);
            if (data.user.memberships && data.user.memberships.length > 0) {
              useTenantStore.getState().setUserTenants(data.user.memberships);
              const firstOrg = data.user.memberships[0];
              useTenantStore.getState().setTenantInfo(firstOrg.organizationId, firstOrg.organization, firstOrg.role?.name || 'Member');
            }
          }
        } else {
          if (isMounted) useAuthStore.getState().setUser(null);
        }
      } catch (err) {
        console.error('checkAuth error:', err);
        if (isMounted) useAuthStore.getState().setUser(null);
      } finally {
        console.log('checkAuth finally');
        // ALWAYS call setLoading(false) otherwise the app hangs forever if isMounted is false due to strict mode unmounting the first effect instance
        useAuthStore.getState().setLoading(false);
      }
    }
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const logOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    zustandLogout();
    useTenantStore.getState().clearTenant();
  };

  // Map to old firebase format for smooth transition without breaking everything at once
  const mappedUser = user ? {
    uid: user.id,
    email: user.email,
    displayName: user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email,
    photoURL: user.avatarUrl,
  } : null;

  return (
    <AuthContext.Provider value={{ logOut, user: mappedUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
