import { CentralLog } from '../types/CentralLog';
import { resolveTenantId, mapActionToSeverity } from './base';
import { parseSyslog } from './syslogUtils';

export async function normalizeFirewallLog(raw: any): Promise<CentralLog> {
    const parsed = parseSyslog(raw.raw);

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

        src_ip: srcIp,
        src_port: srcPort ? Number(srcPort) : undefined,
        dst_ip: dstIp,
        dst_port: dstPort ? Number(dstPort) : undefined,
        protocol: protocol,

        rule_name: parsed.rule || parsed.rule_name,
        rule_id: parsed.rule_id || parsed.ruleid,

        raw: raw.raw
    };

    return normalized;
}
