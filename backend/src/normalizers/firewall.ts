import { CentralLog } from '../types/CentralLog';
import { resolveTenantId, mapActionToSeverity } from './base';
import { parseSyslog } from './syslogUtils';

/**
 * Normalize Firewall syslog logs
 * 
 * Example input:
 * {
 *   "tenant": "demo",
 *   "source": "firewall",
 *   "raw": "<134>Aug 20 12:44:56 fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8"
 * }
 */
export async function normalizeFirewallLog(raw: any): Promise<CentralLog> {
    // Parse the syslog string
    const parsed = parseSyslog(raw.raw);

    // Extract fields with common variations
    const action = parsed.action || parsed.act;
    const vendor = parsed.vendor || parsed.vend;
    const product = parsed.product || parsed.prod;
    const srcIp = parsed.src || parsed.src_ip || parsed.source;
    const dstIp = parsed.dst || parsed.dst_ip || parsed.destination || parsed.dest;
    const protocol = parsed.protocol || parsed.proto;
    const srcPort = parsed.src_port || parsed.sport;
    const dstPort = parsed.dst_port || parsed.dport;

    const normalized: CentralLog = {
        timestamp: parsed.timestamp || new Date(),
        tenant: raw.tenant,
        tenantId: await resolveTenantId(raw.tenant),
        source: 'firewall',
        vendor: vendor,
        product: product,
        event_type: `firewall_${action || 'unknown'}`,
        action: action,
        severity: parsed.severity ? Number(parsed.severity) : mapActionToSeverity(action),

        // Network fields
        src_ip: srcIp,
        src_port: srcPort ? Number(srcPort) : undefined,
        dst_ip: dstIp,
        dst_port: dstPort ? Number(dstPort) : undefined,
        protocol: protocol,

        // Security fields
        rule_name: parsed.rule || parsed.rule_name,
        rule_id: parsed.rule_id || parsed.ruleid,

        // Store original
        raw: raw.raw
    };

    return normalized;
}
