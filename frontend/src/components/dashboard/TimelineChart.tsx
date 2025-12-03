import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TimelineChartProps {
    data: { time: string; count: number }[];
}

/**
 * Format time labels based on the bucket type
 */
function formatTimeLabel(timeStr: string): string {
    if (!timeStr) return '';

    // Day format: YYYY-MM-DD
    if (timeStr.length === 10 && timeStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(timeStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Hour format: YYYY-MM-DDTHH:00:00Z
    if (timeStr.includes('T') && timeStr.endsWith(':00:00Z')) {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    // Minute format: YYYY-MM-DDTHH:MM:00Z
    if (timeStr.includes('T') && timeStr.endsWith(':00Z')) {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    return timeStr;
}

export function TimelineChart({ data }: TimelineChartProps) {
    // Handle empty state
    if (!data || data.length === 0) {
        return (
            <Card className="card-premium animate-slide-up overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg font-bold text-slate-800">
                        Events Over Time
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-[300px] text-center">
                        <div className="space-y-2">
                            <div className="text-slate-400 text-5xl">📊</div>
                            <p className="text-slate-600 font-medium">No events found</p>
                            <p className="text-slate-400 text-sm">Try selecting a different time range or tenant</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-premium animate-slide-up overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-800">
                    Events Over Time
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            tickFormatter={formatTimeLabel}
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
                                color: '#1e293b'
                            }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                            labelFormatter={(label) => `Time: ${formatTimeLabel(label)}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fill="url(#colorEvents)"
                            animationDuration={1000}
                            name="Events"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
