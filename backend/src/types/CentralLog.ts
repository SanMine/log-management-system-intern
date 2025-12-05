
export interface CentralLog {

    timestamp: Date;

    tenant: string;

    tenantId: number;

    source: LogSource;


    vendor?: string;

    product?: string;


    event_type: string;

    event_subtype?: string;

    severity?: number;

    action?: string;


    src_ip?: string;

    src_port?: number;

    dst_ip?: string;

    dst_port?: number;

    protocol?: string;


    user?: string;

    host?: string;

    process?: string;


    url?: string;

    http_method?: string;

    status_code?: number;


    rule_name?: string;

    rule_id?: string;


    cloud?: {
        
        account_id?: string;

        region?: string;

        service?: string;
    };


    raw: any;

    tags?: string[];
}

export type LogSource =
    | 'api'
    | 'firewall'
    | 'network'
    | 'crowdstrike'
    | 'aws'
    | 'm365'
    | 'ad';
