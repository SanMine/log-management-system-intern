/**
 * Syslog Parser Utilities
 * 
 * Provides simple parsing for key=value format syslog messages
 * commonly used by firewalls and network devices.
 * 
 * Example input:
 * "<134>Aug 20 12:44:56 fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8"
 */

export interface ParsedSyslog {
    timestamp?: Date;
    hostname?: string;
    [key: string]: any;      // Parsed key=value pairs
}

/**
 * Parse syslog string in key=value format
 * 
 * Extracts:
 * - Priority/facility (ignored for now)
 * - Timestamp (basic parsing)
 * - Hostname
 * - key=value pairs
 */
export function parseSyslog(syslogString: string): ParsedSyslog {
    const result: ParsedSyslog = {};

    // Remove priority/facility tag if present: <134>
    let cleaned = syslogString.replace(/^<\d+>/, '');

    // Try to extract timestamp and hostname (very basic)
    // Format: "Aug 20 12:44:56 fw01 ..."
    const timestampRegex = /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+/;
    const timestampMatch = cleaned.match(timestampRegex);

    if (timestampMatch) {
        const timestampStr = timestampMatch[1];
        result.hostname = timestampMatch[2];

        // Parse timestamp (simplified - uses current year)
        result.timestamp = parseSyslogTimestamp(timestampStr);

        // Remove timestamp and hostname from the string
        cleaned = cleaned.substring(timestampMatch[0].length);
    }

    // Extract all key=value pairs
    // Regex: word=value (value can contain any non-space chars)
    const kvRegex = /(\w+)=([^\s]+)/g;
    let match;

    while ((match = kvRegex.exec(cleaned)) !== null) {
        const key = match[1];
        const value = match[2];
        result[key] = value;
    }

    // If we couldn't parse a timestamp, use current time
    if (!result.timestamp) {
        result.timestamp = new Date();
    }

    return result;
}

/**
 * Parse syslog timestamp format: "Aug 20 12:44:56"
 * Note: This is a simplified parser that uses the current year
 */
function parseSyslogTimestamp(timestampStr: string): Date {
    // Syslog format: "Aug 20 12:44:56"
    const currentYear = new Date().getFullYear();
    const dateStr = `${timestampStr} ${currentYear}`;

    const parsed = new Date(dateStr);

    // If parsing failed, return current time
    if (isNaN(parsed.getTime())) {
        return new Date();
    }

    return parsed;
}

/**
 * Extract specific fields from parsed syslog
 * with field name variations
 */
export function extractSyslogField(
    parsed: ParsedSyslog,
    ...fieldNames: string[]
): string | undefined {
    for (const fieldName of fieldNames) {
        if (parsed[fieldName]) {
            return parsed[fieldName];
        }
    }
    return undefined;
}
