import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Alert } from '@/data/mockData';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AlertsTableProps {
    alerts: Alert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
    return (
        <div className="glass-strong rounded-xl border-mono-200 overflow-hidden shadow-lg shadow-mono-300/20">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gradient-to-r from-mono-100 to-transparent border-mono-200 hover:bg-gradient-to-r hover:from-mono-100 hover:to-transparent">
                        <TableHead className="font-semibold text-gray-700">Time</TableHead>
                        <TableHead className="font-semibold text-gray-700">Rule Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tenant</TableHead>
                        <TableHead className="font-semibold text-gray-700">IP</TableHead>
                        <TableHead className="font-semibold text-gray-700">User</TableHead>
                        <TableHead className="font-semibold text-gray-700">Count</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alerts.map((alert) => {
                        return (
                            <TableRow
                                key={alert.id}
                                className="border-mono-100 hover:bg-mono-50/50 transition-colors duration-200 group"
                            >
                                <TableCell className="font-medium text-gray-900">
                                    {new Date(alert.time).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-semibold text-mono-700 group-hover:text-mono-900 transition-colors">
                                    {alert.ruleName}
                                </TableCell>
                                <TableCell className="text-gray-700">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-mono-100 text-mono-700 text-xs font-medium">
                                        {alert.tenant}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-slate-600">
                                    {alert.ip}
                                </TableCell>
                                <TableCell className="text-gray-700">{alert.user || 'N/A'}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                        {alert.count}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <StatusUpdateDropdown alertId={Number(alert.id)} currentStatus={alert.status} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

// Status Update Dropdown Component
function StatusUpdateDropdown({ alertId, currentStatus }: { alertId: number; currentStatus: string }) {
    const { user } = useAuth();
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    // Only viewers can update status - admins are read-only
    const isReadOnly = user?.role === 'ADMIN';

    const handleStatusChange = async (newStatus: string) => {
        if (isReadOnly) return; // Prevent updates for admin

        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5004/api/alerts/${alertId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update status');
            }

            setStatus(newStatus);
        } catch (error: any) {
            console.error('Failed to update alert status:', error);
            alert(error.message || 'Failed to update alert status');
            // Revert on error
            setStatus(currentStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusConfig = (s: string) => {
        switch (s) {
            case 'OPEN':
                return { class: 'gradient-danger text-white border-0', icon: AlertCircle };
            case 'INVESTIGATING':
                return { class: 'gradient-warning text-white border-0', icon: Clock };
            case 'RESOLVED':
                return { class: 'gradient-success text-white border-0', icon: CheckCircle };
            default:
                return { class: 'bg-gray-500 text-white', icon: AlertCircle };
        }
    };

    const statusConfig = getStatusConfig(status);

    // If read-only (admin), show badge instead of dropdown
    if (isReadOnly) {
        return (
            <div className="relative group">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.class}`}>
                    {status === 'OPEN' && 'Open'}
                    {status === 'INVESTIGATING' && 'Investigating'}
                    {status === 'RESOLVED' && 'Resolved'}
                </span>
                <span className="absolute hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded -top-8 left-0 whitespace-nowrap z-10">
                    Read-only (Admin)
                </span>
            </div>
        );
    }

    // Viewer: show editable dropdown
    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${statusConfig.class} ${isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-90'}`}
        >
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
        </select>
    );
}
