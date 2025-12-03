import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

/**
 * Normalize CrowdStrike Falcon logs
 * 
 * Example input:
 * {
 *   "tenant": "demoA",
 *   "source": "crowdstrike",
 *   "event_type": "malware_detected",
 *   "host": "WIN10-01",
 *   "process": "powershell.exe",
 *   "severity": 8,
 *   "sha256": "abc...",
 *   "action": "quarantine",
 *   "@timestamp": "2025-08-20T08:00:00Z"
 * }
 */
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

        // Host & Process
        host: raw.host || raw.hostname || raw.ComputerName,
        process: raw.process || raw.ProcessName,
        user: raw.user || raw.UserName,

        // Additional CrowdStrike-specific fields stored in raw
        raw: raw,

        // Tags for important metadata
        tags: [
            raw.sha256 ? `sha256:${raw.sha256}` : '',
            raw.md5 ? `md5:${raw.md5}` : '',
            raw.detection_name ? `detection:${raw.detection_name}` : ''
        ].filter(Boolean)
    };

    return normalized;
}
