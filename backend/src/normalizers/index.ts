import { CentralLog, LogSource } from '../types/CentralLog';
import { validateRequiredFields } from './base';
import { normalizeApiLog } from './api';
import { normalizeFirewallLog } from './firewall';
import { normalizeNetworkLog } from './network';
import { normalizeCrowdStrikeLog } from './crowdstrike';
import { normalizeAwsLog } from './aws';
import { normalizeM365Log } from './m365';
import { normalizeAdLog } from './ad';

/**
 * Main Log Normalizer - Entry Point
 * 
 * Routes incoming logs to the appropriate normalizer based on the source field.
 * 
 * Usage:
 *   const normalized = await normalizeLog(rawLog);
 *   const logEvent = new LogEvent(normalized);
 *   await logEvent.save();
 * 
 * @param raw - Raw log data with at minimum: { tenant, source }
 * @returns Normalized CentralLog object
 * @throws Error if validation fails or source is unsupported
 */
export async function normalizeLog(raw: any): Promise<CentralLog> {
    // ========================================
    // STEP 1: Validate required fields
    // ========================================
    validateRequiredFields(raw, ['tenant', 'source']);

    const source = raw.source as LogSource;

    // ========================================
    // STEP 2: Route to source-specific normalizer
    // ========================================
    switch (source) {
        case 'api':
            return normalizeApiLog(raw);

        case 'firewall':
            return normalizeFirewallLog(raw);

        case 'network':
            return normalizeNetworkLog(raw);

        case 'crowdstrike':
            return normalizeCrowdStrikeLog(raw);

        case 'aws':
            return normalizeAwsLog(raw);

        case 'm365':
            return normalizeM365Log(raw);

        case 'ad':
            return normalizeAdLog(raw);

        default:
            throw new Error(
                `Unsupported log source: "${source}". ` +
                `Supported sources: api, firewall, network, crowdstrike, aws, m365, ad`
            );
    }
}

/**
 * Get list of supported log sources
 */
export function getSupportedSources(): LogSource[] {
    return ['api', 'firewall', 'network', 'crowdstrike', 'aws', 'm365', 'ad'];
}

/**
 * Check if a source is supported
 */
export function isSourceSupported(source: string): boolean {
    return getSupportedSources().includes(source as LogSource);
}
