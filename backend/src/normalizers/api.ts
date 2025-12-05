import { CentralLog } from '../types/CentralLog';
import { createBaseCentralLog, parseTimestamp, resolveTenantId } from './base';

export async function normalizeApiLog(raw: any): Promise<CentralLog> {
    const base = await createBaseCentralLog(raw);

    const normalized: CentralLog = {
        ...base,
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'api',
        event_type: raw.event_type || 'unknown',

        user: raw.user,
        src_ip: raw.ip || raw.src_ip,
        severity: raw.severity,
        action: raw.action,
        url: raw.url,
        http_method: raw.method || raw.http_method,
        status_code: raw.status_code,
        host: raw.host,

        raw: raw
    };

    return normalized;
}
