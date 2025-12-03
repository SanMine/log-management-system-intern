import { Tenant } from '../models/Tenant';
import { ILogEvent } from '../models/LogEvent';

/**
 * Normalize incoming HTTP log to LogEvent format
 * @param raw - Raw log data from HTTP request
 * @returns Partial LogEvent data
 */
export async function normalizeHttpLog(raw: any): Promise<Partial<ILogEvent>> {
    const normalized: Partial<ILogEvent> = {
        timestamp: raw.timestamp && raw.timestamp !== '' ? new Date(raw.timestamp) : new Date(),
        source: raw.source || 'http',
        event_type: raw.event_type || 'unknown',
        user: raw.user,
        src_ip: raw.ip || raw.src_ip,
        severity: raw.severity,
        action: raw.action,
        raw: raw,
    };

    // Resolve tenant (auto-create if doesn't exist)
    if (raw.tenant || raw.tenantName) {
        const tenantName = raw.tenant || raw.tenantName;
        let tenant = await Tenant.findOne({ name: tenantName });

        // Auto-create tenant if it doesn't exist
        if (!tenant) {
            console.log(`🔧 Auto-creating tenant: ${tenantName}`);
            tenant = new Tenant({
                name: tenantName,
                key: tenantName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10)
            });
            await tenant.save();
            console.log(`✅ Created tenant: ${tenant.id} (${tenant.name})`);
        }
        normalized.tenantId = tenant.id;
    } else if (raw.tenantId) {
        normalized.tenantId = Number(raw.tenantId);
    } else {
        throw new Error('Tenant information is required (tenant or tenantId)');
    }

    return normalized;
}
