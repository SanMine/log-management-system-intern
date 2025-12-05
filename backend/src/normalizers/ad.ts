import { CentralLog } from '../types/CentralLog';
import { parseTimestamp, resolveTenantId } from './base';

export async function normalizeAdLog(raw: any): Promise<CentralLog> {
    const eventId = raw.event_id || raw.EventID;
    const eventType = raw.event_type || mapEventIdToType(eventId);

    const normalized: CentralLog = {
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp || raw.TimeGenerated),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'ad',
        vendor: 'Microsoft',
        product: 'Active Directory',
        event_type: eventType,
        event_subtype: eventId ? `EventID:${eventId}` : undefined,

        user: raw.user || raw.TargetUserName || raw.SubjectUserName,
        host: raw.host || raw.Computer || raw.Workstation,
        src_ip: raw.ip || raw.IpAddress || raw.src_ip,

        action: mapAdEventToAction(eventType, eventId),
        severity: calculateAdSeverity(eventId),

        tags: [
            raw.logon_type ? `logon_type:${raw.logon_type}` : '',
            raw.LogonType ? `logon_type:${raw.LogonType}` : '',
            eventId ? `event_id:${eventId}` : ''
        ].filter(Boolean),

        raw: raw
    };

    return normalized;
}

function mapEventIdToType(eventId?: number): string {
    if (!eventId) return 'unknown';

    const eventMap: Record<number, string> = {
        4624: 'LogonSuccess',
        4625: 'LogonFailed',
        4634: 'Logoff',
        4720: 'UserCreated',
        4726: 'UserDeleted',
        4728: 'UserAddedToGroup',
        4732: 'MemberAddedToGroup',
        4740: 'UserLocked',
        4767: 'UserUnlocked',
        4768: 'KerberosAuthTicket',
        4769: 'KerberosServiceTicket',
        4776: 'CredentialValidation'
    };

    return eventMap[eventId] || `EventID_${eventId}`;
}

function mapAdEventToAction(eventType: string, eventId?: number): string | undefined {
    const typeLower = eventType.toLowerCase();

    if (typeLower.includes('logon') && !typeLower.includes('failed')) return 'login';
    if (typeLower.includes('logoff')) return 'logout';
    if (typeLower.includes('created')) return 'create';
    if (typeLower.includes('deleted')) return 'delete';
    if (typeLower.includes('failed')) return 'deny';

    if (eventId === 4624) return 'login';
    if (eventId === 4625) return 'deny';
    if (eventId === 4634) return 'logout';

    return undefined;
}

function calculateAdSeverity(eventId?: number): number {
    if (!eventId) return 5;

    const highSeverityEvents = [4625, 4740, 4720, 4726];
    if (highSeverityEvents.includes(eventId)) {
        return 7;
    }

    const mediumSeverityEvents = [4624, 4728, 4732];
    if (mediumSeverityEvents.includes(eventId)) {
        return 5;
    }

    return 3;
}
