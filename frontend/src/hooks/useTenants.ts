import { useState, useEffect } from 'react';
import { tenantsAPI } from '@/services/api';

export interface TenantOption {
    value: string;
    label: string;
}

export function useTenants() {
    const [tenants, setTenants] = useState<TenantOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchTenants() {
            setIsLoading(true);
            setError('');
            try {
                const data = await tenantsAPI.getTenants();

                const tenantOptions: TenantOption[] = [
                    { value: 'all', label: 'All Tenants' },
                    ...data.map((tenant: any) => ({
                        value: String(tenant.id),
                        label: tenant.name
                    }))
                ];

                setTenants(tenantOptions);
            } catch (err: any) {
                console.error('Failed to fetch tenants:', err);
                setError(err.message || 'Failed to load tenants');
                setTenants([
                    { value: 'all', label: 'All Tenants' },
                    { value: '1', label: 'Tenant 1' },
                    { value: '2', label: 'Tenant 2' },
                    { value: '3', label: 'Tenant 3' },
                ]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTenants();
    }, []);

    return { tenants, isLoading, error };
}
