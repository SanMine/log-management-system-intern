import { Tenant } from '../models/Tenant';
import { CentralLog } from '../types/CentralLog';

/**
 * Resolve tenant name to tenant ID
 * Auto-creates tenant if it doesn't exist
 */
export async function resolveTenantId(tenantName: string): Promise<number> {
    if (!tenantName) {
        throw new Error('Tenant name is required');
    }

    // Look up tenant by name
    let tenant = await Tenant.findOne({ name: tenantName });

    // Auto-create tenant if it doesn't exist
    if (!tenant) {
        console.log(`🔧 Auto-creating tenant: ${tenantName}`);
        tenant = new Tenant({
            name: tenantName,
            key: generateTenantKey(tenantName)
        });
        await tenant.save();
        console.log(`✅ Created tenant: ${tenant.id} (${tenant.name})`);
    }

    return tenant.id;
}

/**
 * Generate a unique tenant key from tenant name
 * Example: "StandUP.com" → "STANDUPCOM"
 */
function generateTenantKey(tenantName: string): string {
    return tenantName
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
        .toUpperCase()
        .substring(0, 10);               // Limit to 10 chars
}

/**
 * Parse timestamp from various formats
 * Supports:
 * - ISO 8601 / RFC3339 strings
 * - Unix timestamps (seconds or milliseconds)
 * - Date objects
 * Falls back to current time if parsing fails
 */
export function parseTimestamp(input: any): Date {
    // Already a Date object
    if (input instanceof Date) {
        return input;
    }

    // Empty or missing
    if (!input || input === '') {
        return new Date();
    }

    // Try parsing as string (ISO format)
    if (typeof input === 'string') {
        const parsed = new Date(input);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    // Try parsing as Unix timestamp (seconds or milliseconds)
    if (typeof input === 'number') {
        // If timestamp is in seconds (< year 3000 in seconds)
        const timestamp = input < 100000000000 ? input * 1000 : input;
        return new Date(timestamp);
    }

    // Fallback to current time
    console.warn(`Unable to parse timestamp: ${input}, using current time`);
    return new Date();
}

/**
 * Map action strings to severity levels (0-10)
 */
export function mapActionToSeverity(action?: string): number {
    if (!action) return 5; // Default medium severity

    const actionLower = action.toLowerCase();

    // High severity (7-10)
    if (actionLower === 'deny' || actionLower === 'block' || actionLower === 'quarantine') {
        return 7;
    }

    // Medium severity (4-6)
    if (actionLower === 'alert' || actionLower === 'warn') {
        return 5;
    }

    // Low severity (1-3)
    if (actionLower === 'allow' || actionLower === 'permit') {
        return 2;
    }

    return 5; // Default
}

/**
 * Validate that required fields are present
 */
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

/**
 * Extract IP address from various field names
 * Checks: ip, src_ip, source_ip, client_ip
 */
export function extractSourceIP(raw: any): string | undefined {
    return raw.ip || raw.src_ip || raw.source_ip || raw.client_ip;
}

/**
 * Create base CentralLog object with common fields
 * Normalizers can extend this with source-specific fields
 */
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
