import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore } from '../store/useTenantStore';

export function useCRMData(collectionName: string) {
  const { user } = useAuthStore();
  const { currentTenantId } = useTenantStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !currentTenantId) return;
    
    let isMounted = true;
    
    async function fetchData() {
      setLoading(true);
      try {
        const results = await apiFetch(`/crm/${collectionName}`);
        if (isMounted) {
          setData(results);
        }
      } catch (err) {
        console.error("Failed to fetch CRM data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, currentTenantId, collectionName]);

  return { data, loading };
}
