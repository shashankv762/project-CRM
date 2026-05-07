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
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          if (data.user.memberships && data.user.memberships.length > 0) {
            setUserTenants(data.user.memberships);
            const firstOrg = data.user.memberships[0];
            setTenantInfo(firstOrg.organizationId, firstOrg.organization, firstOrg.role.name);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [setUser, setLoading, setUserTenants, setTenantInfo]);

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
