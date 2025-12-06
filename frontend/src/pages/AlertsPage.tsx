import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { alertsAPI } from '@/services/api';
import { timeRangeOptions } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';
import { useTenants } from '@/hooks/useTenants';

export function AlertsPage() {
    const [timeRange, setTimeRange] = useState('24h');
    const [tenant, setTenant] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { tenants: tenantOptions } = useTenants();

    const REFRESH_INTERVAL = 30000; // 30 seconds

    useEffect(() => {
        let isInitialLoad = true;

        async function fetchAlerts() {
            // Only show loading spinner on initial load, not on auto-refresh
            if (isInitialLoad) {
                setIsLoading(true);
            }
            setError('');
            try {
                const data = await alertsAPI.getAlerts(tenant, selectedStatus, timeRange);
                setAlerts(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load alerts');
                console.error('Alerts fetch error:', err);
            } finally {
                if (isInitialLoad) {
                    setIsLoading(false);
                    isInitialLoad = false;
                }
            }
        }

        fetchAlerts();

        // Auto-refresh interval
        const intervalId = setInterval(() => {
            fetchAlerts();
        }, REFRESH_INTERVAL);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [tenant, selectedStatus, timeRange]);

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'OPEN', label: 'Open' },
        { value: 'INVESTIGATING', label: 'Investigating' },
        { value: 'RESOLVED', label: 'Resolved' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                { }
                <div className="animate-slide-up">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-mono-600 to-mono-500 bg-clip-text text-transparent">
                        Alerts Management
                    </h2>
                    <p className="text-gray-600 mt-2">View and manage security alerts</p>
                </div>

                { }
                <div className="glass-strong rounded-xl p-6 border-mono-200 shadow-lg shadow-mono-300/20 animate-slide-up delay-100">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Time Range
                            </label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-full border-mono-300 focus:ring-mono-500 bg-white/80 hover:bg-white transition-colors">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent className="animate-slide-down">
                                    {timeRangeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="cursor-pointer hover:bg-mono-100 transition-colors"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full border-mono-300 focus:ring-mono-500 bg-white/80 hover:bg-white transition-colors">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="animate-slide-down">
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="cursor-pointer hover:bg-mono-100 transition-colors"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tenant
                            </label>
                            <Select value={tenant} onValueChange={setTenant}>
                                <SelectTrigger className="w-full border-mono-300 focus:ring-mono-500 bg-white/80 hover:bg-white transition-colors">
                                    <SelectValue placeholder="Select tenant" />
                                </SelectTrigger>
                                <SelectContent className="animate-slide-down">
                                    {tenantOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="cursor-pointer hover:bg-mono-100 transition-colors"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                { }
                {!isLoading && !error && (
                    <div className="text-sm text-gray-600 animate-fade-in delay-200 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-mono-500 animate-pulse" />
                        Showing <span className="font-semibold text-mono-600">{alerts.length}</span> alerts
                    </div>
                )}

                { }
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading alerts...</p>
                        </div>
                    </div>
                )}

                { }
                {error && !isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-slate-900 font-semibold mb-2">Failed to load alerts</p>
                            <p className="text-slate-600">{error}</p>
                        </div>
                    </div>
                )}

                { }
                {!isLoading && !error && (
                    <div className="animate-slide-up delay-300">
                        <AlertsTable alerts={alerts} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
