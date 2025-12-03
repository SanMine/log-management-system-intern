import { CentralLog } from '../types/CentralLog';
import { resolveTenantId } from './base';
import { parseSyslog } from './syslogUtils';

/**
 * Normalize Network/Router syslog logs
 * 
 * Example input:
 * {
 *   "tenant": "demo",
 *   "source": "network",
 *   "raw": "<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down mac=aa:bb:cc:dd:ee:ff reason=carrier-loss"
 * }
 */
export async function normalizeNetworkLog(raw: any): Promise<CentralLog> {
    // Parse the syslog string
    const parsed = parseSyslog(raw.raw);

    // Extract network-specific fields
    const eventType = parsed.event || parsed.event_type || 'network_event';
    const iface = parsed.if || parsed.interface;
    const mac = parsed.mac;
    const reason = parsed.reason;
    const status = parsed.status || parsed.state;

    const normalized: CentralLog = {
        timestamp: parsed.timestamp || new Date(),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'network',
        vendor: parsed.vendor,
        product: parsed.product || 'router',
        event_type: eventType,

        // Store network-specific data in raw for now
        // Could add custom fields later if needed
        host: parsed.hostname,

        // Use tags for network-specific metadata
        tags: [
            iface ? `interface:${iface}` : '',
            mac ? `mac:${mac}` : '',
            reason ? `reason:${reason}` : '',
            status ? `status:${status}` : ''
        ].filter(Boolean), // Remove empty strings

        // Store original
        raw: raw.raw
    };

    return normalized;
}
