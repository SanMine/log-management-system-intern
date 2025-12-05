import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

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

        user: raw.user || raw.userIdentity?.userName || raw.userIdentity?.principalId,
        src_ip: raw.sourceIPAddress || raw.ip,

        cloud: {
            account_id: raw.cloud?.account_id || raw.accountId,
            region: raw.cloud?.region || raw.awsRegion,
            service: raw.cloud?.service || raw.eventSource
        },

        action: mapAwsEventToAction(raw.event_type || raw.eventName),
        severity: calculateAwsSeverity(raw),

        raw: raw.raw || raw
    };

    return normalized;
}

function mapAwsEventToAction(eventName?: string): string | undefined {
    if (!eventName) return undefined;

    const eventLower = eventName.toLowerCase();

    if (eventLower.includes('create')) return 'create';
    if (eventLower.includes('delete')) return 'delete';
    if (eventLower.includes('update') || eventLower.includes('modify')) return 'update';
    if (eventLower.includes('list') || eventLower.includes('describe') || eventLower.includes('get')) return 'read';

    return undefined;
}

function calculateAwsSeverity(raw: any): number {
    const eventName = (raw.event_type || raw.eventName || '').toLowerCase();

    if (eventName.includes('delete') || eventName.includes('terminate')) {
        return 7;
    }

    if (eventName.includes('create') || eventName.includes('update')) {
        return 5;
    }

    return 3;
}
