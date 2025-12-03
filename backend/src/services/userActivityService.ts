import { LogEvent } from '../models/LogEvent';
import { Alert } from '../models/Alert';

/**
 * Parse time range
 */
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

/**
 * Get user activity data
 */
export async function getUserActivity(
    username: string,
    tenantId: number | null,
    timeRange?: string
) {
    const startTime = parseTimeRange(timeRange);

    // Build query
    const query: any = {
        user: username,
        timestamp: { $gte: startTime },
    };

    if (tenantId !== null) {
        query.tenantId = tenantId;
    }

    // Summary statistics
    const totalEvents = await LogEvent.countDocuments(query);
    const uniqueIps = await LogEvent.distinct('src_ip', query);

    const alertQuery: any = {
        user: username,
        time: { $gte: startTime },
    };
    if (tenantId !== null) {
        alertQuery.tenantId = tenantId;
    }
    const totalAlerts = await Alert.countDocuments(alertQuery);

    // Events over time (grouped by hour)
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

    // Recent events
    const recentEvents = await LogEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .select('timestamp event_type source src_ip tenantId')
        .lean();

    const formattedEvents = recentEvents.map((e: any) => ({
        time: e.timestamp,
        eventType: e.event_type,
        source: e.source,
        ip: e.src_ip,
        tenantId: e.tenantId,
    }));

    // Related alerts
    const relatedAlerts = await Alert.find(alertQuery)
        .sort({ time: -1 })
        .limit(5)
        .select('time ruleName tenantId ip status')
        .lean();

    return {
        summary: {
            totalEvents,
            uniqueIps: uniqueIps.length,
            totalAlerts,
        },
        eventsOverTime,
        recentEvents: formattedEvents,
        relatedAlerts,
    };
}
