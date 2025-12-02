import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { timelineData } from '@/data/mockData';

export function TimelineChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary-dark">
                    Events Over Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="time"
                            stroke="#666"
                            fontSize={12}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="events"
                            stroke="#002455"
                            strokeWidth={2}
                            dot={{ fill: '#002455', r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
