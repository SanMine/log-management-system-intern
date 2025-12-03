import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Alert {
    id: string;
    time: string;
    ruleName: string;
    ip: string;
    user: string;
    count: number;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

interface RecentAlertsProps {
    alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
    const navigate = useNavigate();

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return {
                    class: 'bg-red-50 text-red-700 border-red-100',
                    icon: AlertCircle
                };
            case 'INVESTIGATING':
                return {
                    class: 'bg-amber-50 text-amber-700 border-amber-100',
                    icon: Clock
                };
            case 'RESOLVED':
                return {
                    class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: CheckCircle
                };
            default:
                return {
                    class: 'bg-slate-100 text-slate-600',
                    icon: AlertCircle
                };
        }
    };

    return (
        <Card className="card-premium animate-slide-up overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg font-bold text-slate-800">
                    Recent Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 h-8" onClick={() => navigate('/alerts')}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-100">
                            <TableHead className="font-semibold text-slate-600 pl-6 h-10">Time</TableHead>
                            <TableHead className="font-semibold text-slate-600 h-10">Rule Name</TableHead>
                            <TableHead className="font-semibold text-slate-600 h-10">IP</TableHead>
                            <TableHead className="font-semibold text-slate-600 h-10">Count</TableHead>
                            <TableHead className="font-semibold text-slate-600 pr-6 h-10">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alerts.map((alert) => {
                            const statusConfig = getStatusConfig(alert.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <TableRow
                                    key={alert.id}
                                    className="cursor-pointer border-slate-100 hover:bg-slate-50/80 transition-colors group"
                                    onClick={() => navigate('/alerts')}
                                >
                                    <TableCell className="font-medium text-sm text-slate-600 pl-6 py-3">
                                        {alert.time}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 py-3">
                                        {alert.ruleName}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-slate-500 py-3">
                                        {alert.ip}
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700 py-3">
                                        {alert.count}
                                    </TableCell>
                                    <TableCell className="pr-6 py-3">
                                        <Badge className={`${statusConfig.class} hover:bg-opacity-80 transition-colors flex items-center gap-1.5 w-fit px-2.5 py-0.5 border shadow-sm`}>
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
    );
}
