import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
}

export function SummaryCard({ title, value, icon: Icon }: SummaryCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {title}
                </CardTitle>
                <Icon className="h-5 w-5 text-primary-blue" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-primary-dark">
                    {value.toLocaleString()}
                </div>
            </CardContent>
        </Card>
    );
}
