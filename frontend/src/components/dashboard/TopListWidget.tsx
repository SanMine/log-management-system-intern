import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TopListItem {
    label: string;
    value: number;
}

interface TopListWidgetProps {
    title: string;
    items: TopListItem[];
    labelHeader: string;
    valueHeader: string;
}

export function TopListWidget({ title, items, labelHeader, valueHeader }: TopListWidgetProps) {
    return (
        <Card className="card-premium animate-slide-up overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-800">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-100">
                            <TableHead className="font-semibold text-slate-600 pl-6">{labelHeader}</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 pr-6">{valueHeader}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow
                                key={index}
                                className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                                <TableCell className="font-medium text-slate-700 pl-6">
                                    {item.label}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-brand-600 pr-6">
                                    {item.value.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
