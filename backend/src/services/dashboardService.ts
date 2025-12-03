import { LogEvent } from '../models/LogEvent';
import { Alert } from '../models/Alert';

/**
 * Parse time range string to start date
 * Supports: last_15m, last_1h, last_24h, last_7d
 */
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
            return new Date(now.getTime() - 24 * 60 * 60 * 1000); // default 24h
    }
}

/**
 * Get the appropriate date bucketing format based on time range
 * Returns MongoDB date format string for $dateToString
 */
function getBucketFormat(timeRange?: string): string {
    switch (timeRange) {
        case 'last_15m':
        case 'last_1h':
            return '%Y-%m-%dT%H:%M:00Z'; // Bucket by minute
        case 'last_24h':
            return '%Y-%m-%dT%H:00:00Z'; // Bucket by hour
        case 'last_7d':
            return '%Y-%m-%d'; // Bucket by day
        default:
            return '%Y-%m-%dT%H:00:00Z'; // Default: hour
    }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardData(
    tenantId: number | null,
    timeRange?: string
) {
    const startTime = parseTimeRange(timeRange);

    // Build base query
    const query: any = { timestamp: { $gte: startTime } };
    if (tenantId !== null) {
        query.tenantId = tenantId;
    }

    // Total events
    const totalEvents = await LogEvent.countDocuments(query);

    // Unique IPs
    const uniqueIps = await LogEvent.distinct('src_ip', query);

    // Unique users
    const uniqueUsers = await LogEvent.distinct('user', query);

    // Total alerts
    const alertQuery: any = { time: { $gte: startTime } };
    if (tenantId !== null) {
        alertQuery.tenantId = tenantId;
    }
    const totalAlerts = await Alert.countDocuments(alertQuery);

    // Events over time (grouped dynamically based on time range)
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

    // Top IPs
    const topIps = await LogEvent.aggregate([
        { $match: query },
        { $match: { src_ip: { $exists: true, $ne: null } } },
        { $group: { _id: '$src_ip', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { ip: '$_id', count: 1, _id: 0 } },
    ]);

    // Top users
    const topUsers = await LogEvent.aggregate([
        { $match: query },
        { $match: { user: { $exists: true, $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { user: '$_id', count: 1, _id: 0 } },
    ]);

    // Top event types
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
