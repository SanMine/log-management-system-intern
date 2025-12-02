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
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary-dark">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{labelHeader}</TableHead>
                            <TableHead className="text-right">{valueHeader}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.label}</TableCell>
                                <TableCell className="text-right font-semibold">
                                    {item.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
