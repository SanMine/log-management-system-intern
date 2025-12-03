import { LogEvent, ILogEvent } from '../models/LogEvent';
import { normalizeLog } from '../normalizers';
import * as alertService from './alertService';

/**
 * Create a new log event from raw data
 * Uses the unified normalizer to convert any log format to central schema
 */
export async function createLogEvent(raw: any): Promise<ILogEvent> {
    // Normalize using the unified pipeline
    const normalized = await normalizeLog(raw);

    // Create LogEvent document
    const logEvent = new LogEvent(normalized);
    await logEvent.save();

    // Process alert rules
    await alertService.processEvent(logEvent);

    return logEvent;
}

/**
 * Get log events with filters
 */
export async function getLogEvents(filters: {
    tenantId?: number | null;
    user?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}): Promise<ILogEvent[]> {
    const query: any = {};

    if (filters.tenantId !== null && filters.tenantId !== undefined) {
        query.tenantId = filters.tenantId;
    }

    if (filters.user) {
        query.user = filters.user;
    }

    if (filters.startTime || filters.endTime) {
        query.timestamp = {};
        if (filters.startTime) {
            query.timestamp.$gte = filters.startTime;
        }
        if (filters.endTime) {
            query.timestamp.$lte = filters.endTime;
        }
    }

    return LogEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);
}
