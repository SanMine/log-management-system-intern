import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
}

export function SummaryCard({ title, value, icon: Icon }: SummaryCardProps) {
    return (
        <Card className="card-premium animate-slide-up group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-600 transition-colors duration-300">
                    <Icon className="h-5 w-5 text-brand-600 group-hover:text-white transition-colors duration-300" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {value.toLocaleString()}
                </div>
            </CardContent>
        </Card>
    );
}
