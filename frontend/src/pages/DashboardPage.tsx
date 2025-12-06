import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { TopListWidget } from '@/components/dashboard/TopListWidget';
import { UploadJsonDialog } from '@/components/dashboard/UploadJsonDialog';
import { dashboardAPI } from '@/services/api';
import { Activity, Server, Users, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DashboardPage() {
    const [selectedTenant, setSelectedTenant] = useState('all');
    const [timeRange, setTimeRange] = useState('last_24h');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const REFRESH_INTERVAL = 30000; // 30 seconds

    useEffect(() => {
        let isInitialLoad = true;

        async function fetchData() {
            // Only show loading spinner on initial load, not on auto-refresh
            if (isInitialLoad) {
                setIsLoading(true);
            }
            setError('');
            try {
                const data = await dashboardAPI.getData(selectedTenant, timeRange);
                setDashboardData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard data');
                console.error('Dashboard fetch error:', err);
            } finally {
                if (isInitialLoad) {
                    setIsLoading(false);
                    isInitialLoad = false;
                }
            }
        }

        fetchData();

        // Auto-refresh interval
        const intervalId = setInterval(() => {
            fetchData();
        }, REFRESH_INTERVAL);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [selectedTenant, timeRange]);

    const handleRefreshData = () => {
        setSelectedTenant(prev => prev);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !dashboardData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-900 font-semibold mb-2">Failed to load dashboard</p>
                        <p className="text-slate-600">{error}</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const topIPItems = dashboardData.topIps?.map((item: any) => ({
        label: item.ip,
        value: item.count,
    })) || [];

    const topUserItems = dashboardData.topUsers?.map((item: any) => ({
        label: item.user,
        value: item.count,
    })) || [];

    const topEventTypeItems = dashboardData.topEventTypes?.map((item: any) => ({
        label: item.event_type,
        value: item.count,
    })) || [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                { }
                <div className="animate-slide-up">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Admin Dashboard
                    </h2>
                    <p className="text-slate-500 mt-1">Monitor and analyze system logs in real-time</p>
                </div>

                { }
                <div className="space-y-4">
                    <UploadJsonDialog onUploadSuccess={handleRefreshData} />
                    <FilterBar
                        tenant={selectedTenant}
                        onTenantChange={setSelectedTenant}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                    />
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="animate-slide-up">
                        <SummaryCard
                            title="Total Events"
                            value={dashboardData.totalEvents}
                            icon={Activity}
                        />
                    </div>
                    <div className="animate-slide-up delay-100">
                        <SummaryCard
                            title="Unique IPs"
                            value={dashboardData.uniqueIps}
                            icon={Server}
                        />
                    </div>
                    <div className="animate-slide-up delay-200">
                        <SummaryCard
                            title="Unique Users"
                            value={dashboardData.uniqueUsers}
                            icon={Users}
                        />
                    </div>
                    <div className="animate-slide-up delay-300">
                        <SummaryCard
                            title="Total Alerts"
                            value={dashboardData.totalAlerts}
                            icon={AlertTriangle}
                        />
                    </div>
                </div>

                { }
                <div className="animate-slide-up delay-400">
                    <TimelineChart data={dashboardData.eventsOverTime} />
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="animate-slide-up delay-100">
                        <TopListWidget
                            title="Top IPs"
                            items={topIPItems}
                            labelHeader="IP Address"
                            valueHeader="Events"
                        />
                    </div>
                    <div className="animate-slide-up delay-200">
                        <TopListWidget
                            title="Top Users"
                            items={topUserItems}
                            labelHeader="User"
                            valueHeader="Events"
                        />
                    </div>
                    <div className="animate-slide-up delay-300">
                        <TopListWidget
                            title="Top Event Types"
                            items={topEventTypeItems}
                            labelHeader="Event Type"
                            valueHeader="Events"
                        />
                    </div>
                </div>

                { }
                { }
            </div>
        </DashboardLayout>
    );
}
