import { LogEvent } from '../models/LogEvent';
import { Alert } from '../models/Alert';

function parseTimeRange(timeRange?: string): Date {
    const now = new Date();
    switch (timeRange) {
        case 'last_15m':
            return new Date(now.getTime() - 15 * 60 * 1000);
        case 'last_1h':
            return new Date(now.getTime() - 60 * 60 * 1000);
        case 'last_24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case 'last_7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
}

function getBucketFormat(timeRange?: string): string {
    switch (timeRange) {
        case 'last_15m':
        case 'last_1h':
            return '%Y-%m-%dT%H:%M:00Z';
        case 'last_24h':
            return '%Y-%m-%dT%H:00:00Z';
        case 'last_7d':
            return '%Y-%m-%d';
        default:
            return '%Y-%m-%dT%H:00:00Z';
    }
}

export async function getDashboardData(
    tenantId: number | null,
    timeRange?: string
) {
    const startTime = parseTimeRange(timeRange);

    const query: any = { timestamp: { $gte: startTime } };
    if (tenantId !== null) {
        query.tenantId = tenantId;
    }

    const totalEvents = await LogEvent.countDocuments(query);

    const uniqueIps = await LogEvent.distinct('src_ip', query);

    const uniqueUsers = await LogEvent.distinct('user', query);

    const alertQuery: any = { time: { $gte: startTime } };
    if (tenantId !== null) {
        alertQuery.tenantId = tenantId;
    }
    const totalAlerts = await Alert.countDocuments(alertQuery);

    const bucketFormat = getBucketFormat(timeRange);
    const eventsOverTime = await LogEvent.aggregate([
        { $match: query },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: bucketFormat,
                        date: '$timestamp',
                    },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { time: '$_id', count: 1, _id: 0 } },
    ]);

    const topIps = await LogEvent.aggregate([
        { $match: query },
        { $match: { src_ip: { $exists: true, $ne: null } } },
        { $group: { _id: '$src_ip', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { ip: '$_id', count: 1, _id: 0 } },
    ]);

    const topUsers = await LogEvent.aggregate([
        { $match: query },
        { $match: { user: { $exists: true, $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { user: '$_id', count: 1, _id: 0 } },
    ]);

    const topEventTypes = await LogEvent.aggregate([
        { $match: query },
        { $group: { _id: '$event_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { event_type: '$_id', count: 1, _id: 0 } },
    ]);

    return {
        totalEvents,
        uniqueIps: uniqueIps.length,
        uniqueUsers: uniqueUsers.length,
        totalAlerts,
        eventsOverTime,
        topIps,
        topUsers,
        topEventTypes,
    };
}
