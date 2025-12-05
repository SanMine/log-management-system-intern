import { Tenant } from '../models/Tenant';
import { CentralLog } from '../types/CentralLog';

export async function resolveTenantId(tenantName: string): Promise<number> {
    if (!tenantName) {
        throw new Error('Tenant name is required');
    }

    let tenant = await Tenant.findOne({ name: tenantName });

    if (!tenant) {
        console.log(` Auto-creating tenant: ${tenantName}`);
        tenant = new Tenant({
            name: tenantName,
            key: generateTenantKey(tenantName)
        });
        await tenant.save();
        console.log(` Created tenant: ${tenant.id} (${tenant.name})`);
    }

    return tenant.id;
}

function generateTenantKey(tenantName: string): string {
    return tenantName
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .substring(0, 10);
}

export function parseTimestamp(input: any): Date {
    if (input instanceof Date) {
        return input;
    }

    if (!input || input === '') {
        return new Date();
    }

    if (typeof input === 'string') {
        const parsed = new Date(input);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    if (typeof input === 'number') {
        const timestamp = input < 100000000000 ? input * 1000 : input;
        return new Date(timestamp);
    }

    console.warn(`Unable to parse timestamp: ${input}, using current time`);
    return new Date();
}

export function mapActionToSeverity(action?: string): number {
    if (!action) return 5;

    const actionLower = action.toLowerCase();

    if (actionLower === 'deny' || actionLower === 'block' || actionLower === 'quarantine') {
        return 7;
    }

    if (actionLower === 'alert' || actionLower === 'warn') {
        return 5;
    }

    if (actionLower === 'allow' || actionLower === 'permit') {
        return 2;
    }

    return 5;
}

export function validateRequiredFields(raw: any, requiredFields: string[]): void {
    const missing: string[] = [];

    for (const field of requiredFields) {
        if (!raw[field]) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
}

export function extractSourceIP(raw: any): string | undefined {
    return raw.ip || raw.src_ip || raw.source_ip || raw.client_ip;
}

export async function createBaseCentralLog(raw: any): Promise<Partial<CentralLog>> {
    return {
        timestamp: parseTimestamp(raw['@timestamp'] || raw.timestamp),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: raw.source,
        event_type: raw.event_type || 'unknown',
        user: raw.user,
        src_ip: extractSourceIP(raw),
        severity: raw.severity,
        action: raw.action,
        raw: raw
    };
}
