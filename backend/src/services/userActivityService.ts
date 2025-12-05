import { LogEvent } from '../models/LogEvent';
import { Alert } from '../models/Alert';

function parseTimeRange(timeRange?: string): Date {
    const now = new Date();
    switch (timeRange) {
        case '15m':
            return new Date(now.getTime() - 15 * 60 * 1000);
        case '1h':
            return new Date(now.getTime() - 60 * 60 * 1000);
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
}

export async function getUserActivity(
    username: string,
    tenantId: number | null,
    timeRange?: string
) {
    const startTime = parseTimeRange(timeRange);

    const baseQuery: any = {
        timestamp: { $gte: startTime },
    };

    if (tenantId !== null) {
        baseQuery.tenantId = tenantId;
    }

    const query: any = username === 'all'
        ? { ...baseQuery }
        : { ...baseQuery, user: username };

    const totalEvents = await LogEvent.countDocuments(query);
    const uniqueIps = await LogEvent.distinct('src_ip', query);

    const uniqueUsers = username === 'all'
        ? await LogEvent.distinct('user', query)
        : [username];

    const alertQuery: any = username === 'all'
        ? {
            time: { $gte: startTime },
            ...(tenantId !== null ? { tenantId } : {})
        }
        : {
            user: username,
            time: { $gte: startTime },
            ...(tenantId !== null ? { tenantId } : {})
        };

    const totalAlerts = await Alert.countDocuments(alertQuery);

    const eventsOverTime = await LogEvent.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%dT%H:00:00Z',
                        date: '$timestamp',
                    },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { time: '$_id', count: 1, _id: 0 } },
    ]);

    const recentEvents = await LogEvent.find(query)
        .sort({ timestamp: -1 })
        .select('timestamp event_type source src_ip tenantId user')
        .lean();

    const formattedEvents = recentEvents.map((e: any) => ({
        time: e.timestamp,
        eventType: e.event_type,
        source: e.source,
        ip: e.src_ip,
        tenantId: e.tenantId,
        user: e.user,
    }));

    const relatedAlerts = await Alert.find(alertQuery)
        .sort({ time: -1 })
        .limit(5)
        .select('time ruleName tenantId ip status user')
        .lean();

    return {
        summary: {
            totalEvents,
            uniqueIps: uniqueIps.length,
            totalAlerts,
            uniqueUsers: uniqueUsers.length,
        },
        eventsOverTime,
        recentEvents: formattedEvents,
        relatedAlerts,
    };
}
