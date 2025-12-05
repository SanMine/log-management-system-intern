import { CentralLog, LogSource } from '../types/CentralLog';
import { validateRequiredFields } from './base';
import { normalizeApiLog } from './api';
import { normalizeFirewallLog } from './firewall';
import { normalizeNetworkLog } from './network';
import { normalizeCrowdStrikeLog } from './crowdstrike';
import { normalizeAwsLog } from './aws';
import { normalizeM365Log } from './m365';
import { normalizeAdLog } from './ad';

export async function normalizeLog(raw: any): Promise<CentralLog> {
    validateRequiredFields(raw, ['tenant', 'source']);

    const source = raw.source as LogSource;

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

export function getSupportedSources(): LogSource[] {
    return ['api', 'firewall', 'network', 'crowdstrike', 'aws', 'm365', 'ad'];
}

export function isSourceSupported(source: string): boolean {
    return getSupportedSources().includes(source as LogSource);
}
