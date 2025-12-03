/**
 * Central Log Schema - Unified format for all log sources
 * 
 * This interface defines the standardized structure that ALL incoming logs
 * are normalized into, regardless of their original format.
 */
export interface CentralLog {
    // ========================================
    // CORE REQUIRED FIELDS
    // ========================================

    /** Event timestamp in RFC3339 format */
    timestamp: Date;

    /** Tenant name (e.g., "demo.com") */
    tenant: string;

    /** Resolved tenant ID from database */
    tenantId: number;

    /** Log source type */
    source: LogSource;

    // ========================================
    // VENDOR & PRODUCT IDENTIFICATION
    // ========================================

    /** Vendor name (e.g., "Cisco", "Palo Alto", "Microsoft") */
    vendor?: string;

    /** Product name (e.g., "ASA", "Firewall", "Defender") */
    product?: string;

    // ========================================
    // EVENT CLASSIFICATION
    // ========================================

    /** Primary event type (e.g., "login_failed", "malware_detected") */
    event_type: string;

    /** Additional event classification */
    event_subtype?: string;

    /** Severity level (0-10 scale) */
    severity?: number;

    /** Action taken (allow | deny | create | delete | login | logout | alert | quarantine) */
    action?: string;

    // ========================================
    // NETWORK FIELDS
    // ========================================

    /** Source IP address */
    src_ip?: string;

    /** Source port number */
    src_port?: number;

    /** Destination IP address */
    dst_ip?: string;

    /** Destination port number */
    dst_port?: number;

    /** Network protocol (TCP | UDP | ICMP | etc.) */
    protocol?: string;

    // ========================================
    // IDENTITY & HOST
    // ========================================

    /** Username or email */
    user?: string;

    /** Hostname or computer name */
    host?: string;

    /** Process name or path */
    process?: string;

    // ========================================
    // WEB / HTTP FIELDS
    // ========================================

    /** URL or URI */
    url?: string;

    /** HTTP method (GET | POST | PUT | DELETE | etc.) */
    http_method?: string;

    /** HTTP status code (200, 404, 500, etc.) */
    status_code?: number;

    // ========================================
    // SECURITY / FIREWALL
    // ========================================

    /** Firewall or IDS rule name */
    rule_name?: string;

    /** Rule identifier */
    rule_id?: string;

    // ========================================
    // CLOUD PROVIDER FIELDS
    // ========================================

    /** Cloud-specific metadata */
    cloud?: {
        /** Cloud account ID */
        account_id?: string;

        /** Cloud region (e.g., "us-east-1", "ap-southeast-1") */
        region?: string;

        /** Cloud service name (e.g., "EC2", "IAM", "S3") */
        service?: string;
    };

    // ========================================
    // RAW DATA & METADATA
    // ========================================

    /** Original raw log data (preserved for reference) */
    raw: any;

    /** Custom tags for categorization */
    tags?: string[];
}

/**
 * Supported log source types
 */
export type LogSource =
    | 'api'           // Generic API logs
    | 'firewall'      // Firewall syslog
    | 'network'       // Network device syslog
    | 'crowdstrike'   // CrowdStrike Falcon
    | 'aws'           // AWS CloudTrail
    | 'm365'          // Microsoft 365 / Office 365
    | 'ad';           // Active Directory / Windows Security
