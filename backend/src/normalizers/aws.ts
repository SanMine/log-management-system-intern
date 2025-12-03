import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

/**
 * Normalize AWS CloudTrail logs
 * 
 * Example input:
 * {
 *   "tenant": "demoB",
 *   "source": "aws",
 *   "cloud": {
 *     "service": "iam",
 *     "account_id": "123456789012",
 *     "region": "ap-southeast-1"
 *   },
 *   "event_type": "CreateUser",
 *   "user": "admin",
 *   "@timestamp": "2025-08-20T09:10:00Z",
 *   "raw": {
 *     "eventName": "CreateUser",
 *     "requestParameters": {
 *       "userName": "temp-user"
 *     }
 *   }
 * }
 */
export async function normalizeAwsLog(raw: any): Promise<CentralLog> {
    const normalized: CentralLog = {
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp || raw.eventTime),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'aws',
        vendor: 'Amazon Web Services',
        product: 'CloudTrail',
        event_type: raw.event_type || raw.eventName || 'unknown',
        event_subtype: raw.eventSource,

        // User information
        user: raw.user || raw.userIdentity?.userName || raw.userIdentity?.principalId,
        src_ip: raw.sourceIPAddress || raw.ip,

        // Cloud-specific fields
        cloud_account_id: raw.cloud?.account_id || raw.accountId,
        cloud_region: raw.cloud?.region || raw.awsRegion,
        cloud_service: raw.cloud?.service || raw.eventSource,

        // Additional metadata
        action: mapAwsEventToAction(raw.event_type || raw.eventName),
        severity: calculateAwsSeverity(raw),

        // Store full CloudTrail event
        raw: raw.raw || raw
    };

    return normalized;
}

/**
 * Map AWS event names to standard actions
 */
function mapAwsEventToAction(eventName?: string): string | undefined {
    if (!eventName) return undefined;

    const eventLower = eventName.toLowerCase();

    if (eventLower.includes('create')) return 'create';
    if (eventLower.includes('delete')) return 'delete';
    if (eventLower.includes('update') || eventLower.includes('modify')) return 'update';
    if (eventLower.includes('list') || eventLower.includes('describe') || eventLower.includes('get')) return 'read';

    return undefined;
}

/**
 * Calculate severity based on AWS event characteristics
 */
function calculateAwsSeverity(raw: any): number {
    // High severity for administrative actions
    const eventName = (raw.event_type || raw.eventName || '').toLowerCase();

    if (eventName.includes('delete') || eventName.includes('terminate')) {
        return 7; // High
    }

    if (eventName.includes('create') || eventName.includes('update')) {
        return 5; // Medium
    }

    return 3; // Low (read operations)
}
