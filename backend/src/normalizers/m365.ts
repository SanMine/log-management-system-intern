import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

/**
 * Normalize Microsoft 365 audit logs
 * 
 * Example input:
 * {
 *   "tenant": "demoB",
 *   "source": "m365",
 *   "event_type": "UserLoggedIn",
 *   "user": "bob@demo.local",
 *   "ip": "198.51.100.23",
 *   "status": "Success",
 *   "workload": "Exchange",
 *   "@timestamp": "2025-08-20T10:05:00Z"
 * }
 */
export async function normalizeM365Log(raw: any): Promise<CentralLog> {
    const normalized: CentralLog = {
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp || raw.CreationTime),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'm365',
        vendor: 'Microsoft',
        product: 'Microsoft 365',
        event_type: raw.event_type || raw.Operation || 'unknown',
        event_subtype: raw.Workload || raw.workload,

        // User information
        user: raw.user || raw.UserId || raw.UserKey,
        src_ip: raw.ip || raw.ClientIP || raw.client_ip,

        // Action mapping
        action: mapM365ToAction(raw.event_type || raw.Operation),
        severity: calculateM365Severity(raw),

        // Additional fields
        url: raw.ObjectId || raw.url,

        // Store status and workload in tags
        tags: [
            raw.status ? `status:${raw.status}` : '',
            raw.Status ? `status:${raw.Status}` : '',
            raw.workload ? `workload:${raw.workload}` : '',
            raw.Workload ? `workload:${raw.Workload}` : ''
        ].filter(Boolean),

        //Store original
        raw: raw
    };

    return normalized;
}

/**
 * Map M365 operations to standard actions
 */
function mapM365ToAction(operation?: string): string | undefined {
    if (!operation) return undefined;

    const opLower = operation.toLowerCase();

    if (opLower.includes('login') || opLower.includes('loggedin')) return 'login';
    if (opLower.includes('logout') || opLower.includes('loggedout')) return 'logout';
    if (opLower.includes('create')) return 'create';
    if (opLower.includes('delete')) return 'delete';
    if (opLower.includes('update') || opLower.includes('modify')) return 'update';
    if (opLower.includes('read') || opLower.includes('view') || opLower.includes('access')) return 'read';

    return undefined;
}

/**
 * Calculate severity for M365 events
 */
function calculateM365Severity(raw: any): number {
    const status = (raw.status || raw.Status || '').toLowerCase();

    // Failed operations are higher severity
    if (status.includes('fail')) {
        return 6;
    }

    const operation = (raw.event_type || raw.Operation || '').toLowerCase();

    // Admin operations
    if (operation.includes('admin') || operation.includes('delete')) {
        return 5;
    }

    return 3; // Normal operations
}
