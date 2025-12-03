import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { Activity, Server, AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { usersAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTenants } from '@/hooks/useTenants';

export function UsersActivityPage() {
    const { user: currentUser } = useAuth();
    const [selectedTenant, setSelectedTenant] = useState('all');
    const [selectedUser, setSelectedUser] = useState('');
    const [timeRange, setTimeRange] = useState('24h');
    const { tenants: fetchedTenants } = useTenants();

    const [users, setUsers] = useState<string[]>([]);
    const [activityData, setActivityData] = useState<any>(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [error, setError] = useState('');

    // RBAC: Determine available tenants based on role
    const availableTenants = currentUser?.role === 'ADMIN'
        ? fetchedTenants  // Admin sees all tenants from backend
        : fetchedTenants.filter(t => t.value === String(currentUser?.tenantId)); // Viewer sees only their tenant

    // If viewer, lock tenant to their assigned tenant
    const effectiveTenant = currentUser?.role === 'VIEWER'
        ? String(currentUser.tenantId)
        : selectedTenant;

    //Fetch users when tenant changes
    useEffect(() => {
        async function fetchUsers() {
            setIsLoadingUsers(true);
            setError('');
            try {
                const data = await usersAPI.getUsers(effectiveTenant);
                setUsers(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load users');
                console.error('Users fetch error:', err);
            } finally {
                setIsLoadingUsers(false);
            }
        }
        if (currentUser) {
            fetchUsers();
        }
    }, [effectiveTenant, currentUser]);

    // Fetch user activity when user selection changes
    useEffect(() => {
        async function fetchActivity() {
            if (!selectedUser) {
                setActivityData(null);
                return;
            }

            setIsLoadingActivity(true);
            setError('');
            try {
                const data = await usersAPI.getUserActivity(
                    selectedUser,
                    effectiveTenant,
                    timeRange
                );
                setActivityData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load user activity');
                console.error('User activity fetch error:', err);
            } finally {
                setIsLoadingActivity(false);
            }
        }
        fetchActivity();
    }, [selectedUser, effectiveTenant, timeRange]);

    const handleTenantChange = (tenant: string) => {
        setSelectedTenant(tenant);
        setSelectedUser(''); // Reset user selection when tenant changes
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return {
                    class: 'bg-red-50 text-red-700 border-red-100',
                    icon: AlertCircle,
                };
            case 'INVESTIGATING':
                return {
                    class: 'bg-amber-50 text-amber-700 border-amber-100',
                    icon: Clock,
                };
            case 'RESOLVED':
                return {
                    class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: CheckCircle,
                };
            default:
                return {
                    class: 'bg-slate-100 text-slate-600',
                    icon: AlertCircle,
                };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Title */}
                <div className="animate-slide-up">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        User Activity
                    </h2>
                    <p className="text-slate-500 mt-1">Inspect security events for a specific user</p>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-6 items-center animate-slide-up">
                    {/* Time Range */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Time Range
                        </label>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 hover:bg-white transition-colors">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1h" className="cursor-pointer focus:bg-brand-50 focus:text-brand-700">
                                    Last 1 hour
                                </SelectItem>
                                <SelectItem value="24h" className="cursor-pointer focus:bg-brand-50 focus:text-brand-700">
                                    Last 24 hours
                                </SelectItem>
                                <SelectItem value="7d" className="cursor-pointer focus:bg-brand-50 focus:text-brand-700">
                                    Last 7 days
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tenant Selector (RBAC-aware) */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Tenant
                        </label>
                        <Select
                            value={effectiveTenant}
                            onValueChange={handleTenantChange}
                            disabled={currentUser?.role === 'VIEWER'}
                        >
                            <SelectTrigger className="w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <SelectValue placeholder="Select tenant" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTenants.map((tenant) => (
                                    <SelectItem
                                        key={tenant.value}
                                        value={tenant.value}
                                        className="cursor-pointer focus:bg-brand-50 focus:text-brand-700"
                                    >
                                        {tenant.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* User Selector */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            User
                        </label>
                        <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isLoadingUsers}>
                            <SelectTrigger className="w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 hover:bg-white transition-colors">
                                <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Select user'} />
                            </SelectTrigger>
                            <SelectContent>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <SelectItem
                                            key={user}
                                            value={user}
                                            className="cursor-pointer focus:bg-brand-50 focus:text-brand-700"
                                        >
                                            {user}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-1.5 text-sm text-slate-500">
                                        No users available
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Empty State or User Activity Content */}
                {!selectedUser ? (
                    <Card className="card-premium">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Activity className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                No User Selected
                            </h3>
                            <p className="text-slate-500 text-center max-w-md">
                                Select a tenant and user from the filters above to view their activity
                            </p>
                        </CardContent>
                    </Card>
                ) : isLoadingActivity ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading activity...</p>
                        </div>
                    </div>
                ) : error ? (
                    <Card className="card-premium">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Failed to Load Activity
                            </h3>
                            <p className="text-slate-500">{error}</p>
                        </CardContent>
                    </Card>
                ) : activityData ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="animate-slide-up">
                                <SummaryCard
                                    title="Total Events"
                                    value={activityData.summary?.totalEvents || 0}
                                    icon={Activity}
                                />
                            </div>
                            <div className="animate-slide-up delay-100">
                                <SummaryCard
                                    title="Unique IPs"
                                    value={activityData.summary?.uniqueIps || 0}
                                    icon={Server}
                                />
                            </div>
                            <div className="animate-slide-up delay-200">
                                <SummaryCard
                                    title="Total Alerts"
                                    value={activityData.summary?.totalAlerts || 0}
                                    icon={AlertTriangle}
                                />
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <Card className="card-premium animate-slide-up overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg font-bold text-slate-800">
                                    Activity Over Time - {selectedUser}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={activityData.eventsOverTime || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                color: '#1e293b',
                                            }}
                                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            dot={{ fill: '#2563eb', r: 4 }}
                                            activeDot={{ r: 6 }}
                                            animationDuration={1000}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Events Table */}
                        <Card className="card-premium animate-slide-up overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg font-bold text-slate-800">
                                    Recent Events
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-100">
                                            <TableHead className="font-semibold text-slate-600 pl-6">Time</TableHead>
                                            <TableHead className="font-semibold text-slate-600">Event Type</TableHead>
                                            <TableHead className="font-semibold text-slate-600">Source</TableHead>
                                            <TableHead className="font-semibold text-slate-600">IP</TableHead>
                                            <TableHead className="font-semibold text-slate-600 pr-6">Tenant</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activityData.recentEvents?.map((event: any, index: number) => (
                                            <TableRow
                                                key={index}
                                                className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                                            >
                                                <TableCell className="font-medium text-sm text-slate-600 pl-6">
                                                    {new Date(event.time).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    {event.eventType}
                                                </TableCell>
                                                <TableCell className="text-slate-600">{event.source}</TableCell>
                                                <TableCell className="font-mono text-sm text-slate-500">{event.ip}</TableCell>
                                                <TableCell className="pr-6">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                        {fetchedTenants.find(t => t.value === String(event.tenantId))?.label || `Tenant ${event.tenantId}`}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Related Alerts */}
                        <Card className="card-premium animate-slide-up overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg font-bold text-slate-800">
                                    Related Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-100">
                                            <TableHead className="font-semibold text-slate-600 pl-6">Time</TableHead>
                                            <TableHead className="font-semibold text-slate-600">Rule Name</TableHead>
                                            <TableHead className="font-semibold text-slate-600">Tenant</TableHead>
                                            <TableHead className="font-semibold text-slate-600">IP</TableHead>
                                            <TableHead className="font-semibold text-slate-600 pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activityData.relatedAlerts?.map((alert: any, index: number) => {
                                            const statusConfig = getStatusConfig(alert.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <TableRow
                                                    key={index}
                                                    className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                                                >
                                                    <TableCell className="font-medium text-sm text-slate-600 pl-6">
                                                        {new Date(alert.time).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-900">
                                                        {alert.ruleName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                            {fetchedTenants.find(t => t.value === String(alert.tenantId))?.label || `Tenant ${alert.tenantId}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm text-slate-500">{alert.ip}</TableCell>
                                                    <TableCell className="pr-6">
                                                        <Badge
                                                            className={`${statusConfig.class} hover:bg-opacity-80 transition-colors flex items-center gap-1.5 w-fit px-2.5 py-0.5 border shadow-sm`}
                                                        >
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {alert.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>
        </DashboardLayout>
    );
}
