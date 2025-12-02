import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { allAlerts, timeRangeOptions, tenantOptions } from '@/data/mockData';

export function AlertsPage() {
    const [timeRange, setTimeRange] = useState('24h');
    const [tenant, setTenant] = useState('all');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Title */}
                <div>
                    <h2 className="text-3xl font-bold text-primary-dark">Alerts Management</h2>
                    <p className="text-gray-600 mt-1">View and manage security alerts</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Range
                            </label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRangeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tenant
                            </label>
                            <Select value={tenant} onValueChange={setTenant}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select tenant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenantOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Alerts Count */}
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{allAlerts.length}</span> alerts
                </div>

                {/* Alerts Table */}
                <AlertsTable alerts={allAlerts} />
            </div>
        </DashboardLayout>
    );
}
