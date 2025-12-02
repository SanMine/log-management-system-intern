import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Alert } from '@/data/mockData';

interface AlertsTableProps {
    alerts: Alert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-alert-red text-white hover:bg-alert-red';
            case 'INVESTIGATING':
                return 'bg-alert-lightRed text-white hover:bg-alert-lightRed';
            case 'RESOLVED':
                return 'bg-green-600 text-white hover:bg-green-600';
            default:
                return 'bg-gray-500 text-white hover:bg-gray-500';
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Time</TableHead>
                        <TableHead className="font-semibold">Rule Name</TableHead>
                        <TableHead className="font-semibold">Tenant</TableHead>
                        <TableHead className="font-semibold">IP</TableHead>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Count</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alerts.map((alert) => (
                        <TableRow
                            key={alert.id}
                            className="hover:bg-gray-50 cursor-pointer"
                        >
                            <TableCell className="font-medium text-sm">
                                {alert.time}
                            </TableCell>
                            <TableCell>{alert.ruleName}</TableCell>
                            <TableCell>{alert.tenant}</TableCell>
                            <TableCell className="font-mono text-sm">{alert.ip}</TableCell>
                            <TableCell>{alert.user}</TableCell>
                            <TableCell className="font-semibold">{alert.count}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(alert.status)}>
                                    {alert.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
