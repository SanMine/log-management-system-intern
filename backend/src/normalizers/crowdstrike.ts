import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

export async function normalizeCrowdStrikeLog(raw: any): Promise<CentralLog> {
    const normalized: CentralLog = {
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'crowdstrike',
        vendor: 'CrowdStrike',
        product: 'Falcon',
        event_type: raw.event_type || raw.eventType || 'unknown',
        event_subtype: raw.event_subtype,
        severity: raw.severity,
        action: raw.action,

        host: raw.host || raw.hostname || raw.ComputerName,
        process: raw.process || raw.ProcessName,
        user: raw.user || raw.UserName,

        raw: raw,

        tags: [
            raw.sha256 ? `sha256:${raw.sha256}` : '',
            raw.md5 ? `md5:${raw.md5}` : '',
            raw.detection_name ? `detection:${raw.detection_name}` : ''
        ].filter(Boolean)
    };

    return normalized;
}
