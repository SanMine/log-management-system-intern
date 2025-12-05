import { CentralLog } from '../types/CentralLog';
import { resolveTenantId } from './base';
import { parseSyslog } from './syslogUtils';

export async function normalizeNetworkLog(raw: any): Promise<CentralLog> {
    const parsed = parseSyslog(raw.raw);

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

        host: parsed.hostname,

        tags: [
            iface ? `interface:${iface}` : '',
            mac ? `mac:${mac}` : '',
            reason ? `reason:${reason}` : '',
            status ? `status:${status}` : ''
        ].filter(Boolean),

        raw: raw.raw
    };

    return normalized;
}
