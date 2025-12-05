import { Alert, IAlert } from '../models/Alert';
import { LogEvent, ILogEvent } from '../models/LogEvent';

/**
 * Parse time range string to start date
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
 * Get alerts with filters and populate tenant info
 */
export async function getAlerts(filters: {
    tenantId?: number | null;
    status?: string;
    timeRange?: string;
}): Promise<any[]> {
    const matchStage: any = {};

    // Tenant filter
    if (filters.tenantId !== null && filters.tenantId !== undefined) {
        matchStage.tenantId = filters.tenantId;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
        matchStage.status = filters.status;
    }

    // Time range filter
    if (filters.timeRange) {
        const startTime = parseTimeRange(filters.timeRange);
        matchStage.time = { $gte: startTime };
    }

    // Use aggregation to populate tenant name
    const alerts = await Alert.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'tenants',
                localField: 'tenantId',
                foreignField: 'id',
                as: 'tenantInfo'
            }
        },
        {
            $addFields: {
                tenant: { $arrayElemAt: ['$tenantInfo.name', 0] }
            }
        },
        {
            $project: {
                tenantInfo: 0  // Remove the temporary tenantInfo array
            }
        },
        { $sort: { time: -1 } }
    ]);

    return alerts;
}

/**
 * Update alert status
 */
export async function updateAlertStatus(
    alertId: number,
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
): Promise<IAlert | null> {
    return Alert.findOneAndUpdate({ id: alertId }, { status }, { new: true });
}

/**
 * Create a new alert
 */
export async function createAlert(data: Partial<IAlert>): Promise<IAlert> {
    const alert = new Alert(data);
    await alert.save();
    return alert;
}

// ==========================================
// ALERT RULE ENGINE FUNCTIONS
// ==========================================

/**
 * RULE 1: Check for multiple failed login attempts from same IP + user
 * Triggers if ≥3 failed attempts within 5 minutes
 */
export async function checkMultipleFailedLogins(event: ILogEvent): Promise<void> {
    // Only process login_failed events
    if (event.event_type !== 'login_failed') return;

    // Skip if missing required fields
    if (!event.user || !event.src_ip) return;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Count failed login attempts from same IP + user in last 5 minutes
    const count = await LogEvent.countDocuments({
        tenantId: event.tenantId,
        user: event.user,
        src_ip: event.src_ip,
        event_type: 'login_failed',
        timestamp: { $gte: fiveMinutesAgo },
    });

    // Trigger alert if threshold reached (≥3 attempts)
    if (count >= 3) {
        const ruleName = 'Multiple Failed Login Attempts';

        // Check if alert already exists (prevent duplicates)
        const existingAlert = await Alert.findOne({
            tenantId: event.tenantId,
            user: event.user,
            ip: event.src_ip,
            ruleName,
            status: 'OPEN',
        });

        if (existingAlert) {
            // Update existing alert
            existingAlert.count = count;
            existingAlert.last_event_time = event.timestamp;
            await existingAlert.save();
            console.log(` Updated alert for ${event.user} from ${event.src_ip}: ${count} attempts`);
        } else {
            // Create new alert
            await createAlert({
                tenantId: event.tenantId,
                time: new Date(),
                ruleName,
                ip: event.src_ip,
                user: event.user,
                count,
                status: 'OPEN',
                last_event_time: event.timestamp,
            });
            console.log(` NEW ALERT: ${ruleName} - ${event.user} from ${event.src_ip} (${count} attempts)`);
        }
    }
}

/**
 * RULE 2: Check for distributed failed login attack (multiple IPs → same user)
 * Triggers if failed logins from ≥3 different IPs within 10 minutes
 */
export async function checkDistributedFailedLogins(event: ILogEvent): Promise<void> {
    // Only process login_failed events
    if (event.event_type !== 'login_failed') return;

    // Skip if missing user
    if (!event.user) return;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Count distinct IPs attacking the same user in last 10 minutes
    const result = await LogEvent.aggregate([
        {
            $match: {
                tenantId: event.tenantId,
                user: event.user,
                event_type: 'login_failed',
                timestamp: { $gte: tenMinutesAgo },
                src_ip: { $exists: true, $ne: null },
            },
        },
        {
            $group: {
                _id: '$src_ip',
            },
        },
        {
            $group: {
                _id: null,
                ips: { $push: '$_id' },
                count: { $sum: 1 },
            },
        },
    ]);

    if (result.length === 0) return;

    const distinctIpCount = result[0].count;
    const involvedIps: string[] = result[0].ips;

    // Trigger alert if ≥3 different IPs
    if (distinctIpCount >= 3) {
        const ruleName = 'Distributed Failed Login Attack';

        // Check for existing alert (prevent duplicates)
        const existingAlert = await Alert.findOne({
            tenantId: event.tenantId,
            user: event.user,
            ruleName,
            status: 'OPEN',
        });

        if (existingAlert) {
            // Update existing alert
            existingAlert.count = distinctIpCount;
            existingAlert.involved_ips = involvedIps;
            existingAlert.last_event_time = event.timestamp;
            await existingAlert.save();
            console.log(` Updated distributed attack alert for ${event.user}: ${distinctIpCount} IPs`);
        } else {
            // Create new alert
            await createAlert({
                tenantId: event.tenantId,
                time: new Date(),
                ruleName,
                user: event.user,
                involved_ips: involvedIps,
                count: distinctIpCount,
                status: 'OPEN',
                last_event_time: event.timestamp,
            });
            console.log(` NEW ALERT: ${ruleName} - ${event.user} targeted from ${distinctIpCount} IPs: [${involvedIps.join(', ')}]`);
        }
    }
}

/**
 * Auto-resolve alerts when user successfully logs in
 */
export async function resolveAlertsOnSuccess(event: ILogEvent): Promise<void> {
    // Only process login success events (handle both naming conventions)
    if (event.event_type !== 'login_success' && event.event_type !== 'login_successed') {
        console.log(`⏭️  Skipping auto-resolve - event_type is "${event.event_type}", not login_success/login_successed`);
        return;
    }

    // Skip if missing user
    if (!event.user) {
        console.log(`⏭️  Skipping auto-resolve - no user in event`);
        return;
    }

    console.log(` Checking for OPEN/INVESTIGATING alerts to resolve for user: ${event.user}, tenant: ${event.tenantId}`);

    // First, check if there are any matching alerts (OPEN or INVESTIGATING)
    const existingAlerts = await Alert.find({
        tenantId: event.tenantId,
        user: event.user,
        status: { $in: ['OPEN', 'INVESTIGATING'] },
    });

    console.log(` Found ${existingAlerts.length} OPEN/INVESTIGATING alert(s) for user "${event.user}" in tenant ${event.tenantId}`);
    if (existingAlerts.length > 0) {
        console.log(`   Alert details:`, existingAlerts.map(a => ({
            id: a.id,
            ruleName: a.ruleName,
            status: a.status,
            tenantId: a.tenantId,
            user: a.user
        })));
    }

    // Resolve all OPEN and INVESTIGATING alerts for this user
    const result = await Alert.updateMany(
        {
            tenantId: event.tenantId,
            user: event.user,
            status: { $in: ['OPEN', 'INVESTIGATING'] },
        },
        {
            status: 'RESOLVED',
            resolved_at: new Date(),
        }
    );

    if (result.modifiedCount > 0) {
        console.log(` Auto-resolved ${result.modifiedCount} alert(s) for ${event.user} (successful login)`);
    } else {
        console.log(`ℹ️  No OPEN/INVESTIGATING alerts found for user ${event.user} to resolve`);
        console.log(`   Query was: { tenantId: ${event.tenantId}, user: "${event.user}", status: { $in: ['OPEN', 'INVESTIGATING'] } }`);
    }
}

/**
 * Main entry point: Process event for alert detection
 * Called automatically after log ingestion
 */
export async function processEvent(event: ILogEvent): Promise<void> {
    try {
        if (event.event_type === 'login_failed') {
            // Check both alert rules for failed logins
            await checkMultipleFailedLogins(event);
            await checkDistributedFailedLogins(event);
        }

        if (event.event_type === 'login_success' || event.event_type === 'login_successed') {
            // Auto-resolve open alerts
            await resolveAlertsOnSuccess(event);
        }
    } catch (error) {
        console.error('Alert processing error:', error);
        // Don't throw - alert processing should not break ingestion
    }
}
