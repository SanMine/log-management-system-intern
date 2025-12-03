import { CentralLog } from '../types/CentralLog';
import { createBaseCentralLog, parseTimestamp, resolveTenantId } from './base';

/**
 * Normalize API logs
 * 
 * Example input:
 * {
 *   "tenant": "demo",
 *   "source": "api",
 *   "event_type": "app_login_failed",
 *   "user": "alice",
 *   "ip": "203.0.113.7",
 *   "reason": "wrong password",
 *   "@timestamp": "2025-08-20T07:20:00Z"
 * }
 */
export async function normalizeApiLog(raw: any): Promise<CentralLog> {
    // Start with base fields
    const base = await createBaseCentralLog(raw);

    // API-specific fields
    const normalized: CentralLog = {
        ...base,
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'api',
        event_type: raw.event_type || 'unknown',

        // Additional fields that might be in API logs
        user: raw.user,
        src_ip: raw.ip || raw.src_ip,
        severity: raw.severity,
        action: raw.action,
        url: raw.url,
        http_method: raw.method || raw.http_method,
        status_code: raw.status_code,
        host: raw.host,

        // Store original
        raw: raw
    };

    return normalized;
}
