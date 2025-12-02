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
import { recentAlerts } from '@/data/mockData';

export function RecentAlerts() {
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-alert-red text-white';
            case 'INVESTIGATING':
                return 'bg-alert-lightRed text-white';
            case 'RESOLVED':
                return 'bg-green-600 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary-dark">
                    Recent Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Rule Name</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentAlerts.map((alert) => (
                            <TableRow
                                key={alert.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => navigate('/alerts')}
                            >
                                <TableCell className="font-medium text-sm">
                                    {alert.time}
                                </TableCell>
                                <TableCell>{alert.ruleName}</TableCell>
                                <TableCell className="font-mono text-sm">{alert.ip}</TableCell>
                                <TableCell>{alert.count}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(alert.status)}>
                                        {alert.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
