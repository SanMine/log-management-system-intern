

export interface ParsedSyslog {
    timestamp?: Date;
    hostname?: string;
    [key: string]: any;
}

export function parseSyslog(syslogString: string): ParsedSyslog {
    const result: ParsedSyslog = {};

    let cleaned = syslogString.replace(/^<\d+>/, '');

    const timestampRegex = /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+/;
    const timestampMatch = cleaned.match(timestampRegex);

    if (timestampMatch) {
        const timestampStr = timestampMatch[1];
        result.hostname = timestampMatch[2];

        result.timestamp = parseSyslogTimestamp(timestampStr);

        cleaned = cleaned.substring(timestampMatch[0].length);
    }

    const kvRegex = /(\w+)=([^\s]+)/g;
    let match;

    while ((match = kvRegex.exec(cleaned)) !== null) {
        const key = match[1];
        const value = match[2];
        result[key] = value;
    }

    if (!result.timestamp) {
        result.timestamp = new Date();
    }

    return result;
}

function parseSyslogTimestamp(timestampStr: string): Date {
    const currentYear = new Date().getFullYear();
    const dateStr = `${timestampStr} ${currentYear}`;

    const parsed = new Date(dateStr);

    if (isNaN(parsed.getTime())) {
        return new Date();
    }

    return parsed;
}

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
