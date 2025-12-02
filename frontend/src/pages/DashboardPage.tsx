import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { TopListWidget } from '@/components/dashboard/TopListWidget';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { summaryStats, topIPs, topUsers } from '@/data/mockData';
import { Activity, Server, Users, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
    const topIPItems = topIPs.map((item) => ({
        label: item.ip,
        value: item.events,
    }));

    const topUserItems = topUsers.map((item) => ({
        label: item.user,
        value: item.events,
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Title */}
                <div>
                    <h2 className="text-3xl font-bold text-primary-dark">Admin Dashboard</h2>
                    <p className="text-gray-600 mt-1">Monitor and analyze system logs in real-time</p>
                </div>

                {/* Filter Bar */}
                <FilterBar />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        title="Total Events"
                        value={summaryStats.totalEvents}
                        icon={Activity}
                    />
                    <SummaryCard
                        title="Unique IPs"
                        value={summaryStats.uniqueIPs}
                        icon={Server}
                    />
                    <SummaryCard
                        title="Unique Users"
                        value={summaryStats.uniqueUsers}
                        icon={Users}
                    />
                    <SummaryCard
                        title="Total Alerts"
                        value={summaryStats.totalAlerts}
                        icon={AlertTriangle}
                    />
                </div>

                {/* Timeline Chart */}
                <TimelineChart />

                {/* Top Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopListWidget
                        title="Top IPs"
                        items={topIPItems}
                        labelHeader="IP Address"
                        valueHeader="Events"
                    />
                    <TopListWidget
                        title="Top Users"
                        items={topUserItems}
                        labelHeader="User"
                        valueHeader="Events"
                    />
                </div>

                {/* Recent Alerts */}
                <RecentAlerts />
            </div>
        </DashboardLayout>
    );
}
