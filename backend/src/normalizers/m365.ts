import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

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

        user: raw.user || raw.UserId || raw.UserKey,
        src_ip: raw.ip || raw.ClientIP || raw.client_ip,

        action: mapM365ToAction(raw.event_type || raw.Operation),
        severity: calculateM365Severity(raw),

        url: raw.ObjectId || raw.url,

        tags: [
            raw.status ? `status:${raw.status}` : '',
            raw.Status ? `status:${raw.Status}` : '',
            raw.workload ? `workload:${raw.workload}` : '',
            raw.Workload ? `workload:${raw.Workload}` : ''
        ].filter(Boolean),

        raw: raw
    };

    return normalized;
}

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

function calculateM365Severity(raw: any): number {
    const status = (raw.status || raw.Status || '').toLowerCase();

    if (status.includes('fail')) {
        return 6;
    }

    const operation = (raw.event_type || raw.Operation || '').toLowerCase();

    if (operation.includes('admin') || operation.includes('delete')) {
        return 5;
    }

    return 3;
}
