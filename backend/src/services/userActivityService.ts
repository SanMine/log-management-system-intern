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
 * 
 * @param username - Username to filter by, or "all" for aggregated data
 * @param tenantId - Tenant ID to filter by, or null for all tenants
 * @param timeRange - Time range filter
 */
export async function getUserActivity(
    username: string,
    tenantId: number | null,
    timeRange?: string
) {
    const startTime = parseTimeRange(timeRange);

    // Build base query for time range
    const baseQuery: any = {
        timestamp: { $gte: startTime },
    };

    // Add tenant filter if specified
    if (tenantId !== null) {
        baseQuery.tenantId = tenantId;
    }

    // Add user filter only if NOT "all"
    const query: any = username === 'all'
        ? { ...baseQuery }
        : { ...baseQuery, user: username };

    // Summary statistics
    const totalEvents = await LogEvent.countDocuments(query);
    const uniqueIps = await LogEvent.distinct('src_ip', query);

    // Get unique users (useful for "all" view)
    const uniqueUsers = username === 'all'
        ? await LogEvent.distinct('user', query)
        : [username];

    // Alert query
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

    // All events (no limit, sorted newest first - FILO)
    const recentEvents = await LogEvent.find(query)
        .sort({ timestamp: -1 }) // FILO: First In Last Out (newest first)
        .select('timestamp event_type source src_ip tenantId user')
        .lean();

    const formattedEvents = recentEvents.map((e: any) => ({
        time: e.timestamp,
        eventType: e.event_type,
        source: e.source,
        ip: e.src_ip,
        tenantId: e.tenantId,
        user: e.user, // Include user for "all" view
    }));

    // Related alerts
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
            uniqueUsers: uniqueUsers.length, // New field for "all" view
        },
        eventsOverTime,
        recentEvents: formattedEvents,
        relatedAlerts,
    };
}
