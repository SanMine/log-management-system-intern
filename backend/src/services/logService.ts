import { LogEvent, ILogEvent } from '../models/LogEvent';
import { normalizeLog } from '../normalizers';
import * as alertService from './alertService';

export async function createLogEvent(raw: any): Promise<ILogEvent> {
    const normalized = await normalizeLog(raw);

    const logEvent = new LogEvent(normalized);
    await logEvent.save();

    await alertService.processEvent(logEvent);

    return logEvent;
}

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
