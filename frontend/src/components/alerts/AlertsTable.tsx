import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IPDisplay } from '@/components/alerts/IPDisplay';
import type { Alert } from '@/data/mockData';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AlertsTableProps {
    alerts: Alert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return {
                    class: 'gradient-danger text-white border-0',
                    icon: AlertCircle
                };
            case 'INVESTIGATING':
                return {
                    class: 'gradient-warning text-white border-0',
                    icon: Clock
                };
            case 'RESOLVED':
                return {
                    class: 'gradient-success text-white border-0',
                    icon: CheckCircle
                };
            default:
                return {
                    class: 'bg-gray-500 text-white',
                    icon: AlertCircle
                };
        }
    };

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
                        const statusConfig = getStatusConfig(alert.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <TableRow
                                key={alert.id}
                                className="cursor-pointer border-mono-200 hover:bg-mono-100/50 transition-all duration-200 group"
                            >
                                <TableCell className="font-medium text-sm text-gray-600 group-hover:text-mono-600 transition-colors">
                                    {alert.time}
                                </TableCell>
                                <TableCell className="group-hover:text-mono-600 transition-colors font-medium">
                                    {alert.ruleName}
                                </TableCell>
                                <TableCell className="text-gray-600 group-hover:text-mono-600 transition-colors">
                                    {alert.tenant}
                                </TableCell>
                                <TableCell>
                                    <IPDisplay alert={alert} />
                                </TableCell>
                                <TableCell className="text-gray-600 group-hover:text-mono-600 transition-colors">
                                    {alert.user}
                                </TableCell>
                                <TableCell className="font-semibold text-mono-600">
                                    {alert.count}
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${statusConfig.class} transition-all duration-200 group-hover:shadow-md flex items-center gap-1 w-fit`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {alert.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
