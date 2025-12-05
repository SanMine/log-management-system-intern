import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';
import { LogSource } from '../types/CentralLog';

export interface ILogEvent extends Document {
    id: number;
    timestamp: Date;
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

const logEventSchema = new Schema<ILogEvent>(
    {
        id: { type: Number, unique: true },
        timestamp: { type: Date, required: true, default: Date.now, index: true },
        tenantId: { type: Number, required: true, index: true },
        source: { type: String, required: true, index: true },

        vendor: { type: String },
        product: { type: String },

        event_type: { type: String, required: true, index: true },
        event_subtype: { type: String },
        severity: { type: Number, min: 0, max: 10 },
        action: { type: String },

        src_ip: { type: String, index: true },
        src_port: { type: Number },
        dst_ip: { type: String },
        dst_port: { type: Number },
        protocol: { type: String },

        user: { type: String, index: true },
        host: { type: String },
        process: { type: String },

        url: { type: String },
        http_method: { type: String },
        status_code: { type: Number },

        rule_name: { type: String },
        rule_id: { type: String },

        cloud: {
            account_id: { type: String },
            region: { type: String },
            service: { type: String }
        },

        raw: { type: Schema.Types.Mixed },
        tags: [{ type: String }],
    },
    { timestamps: true }
);


logEventSchema.index({ tenantId: 1, timestamp: -1 });
logEventSchema.index({ tenantId: 1, event_type: 1 });
logEventSchema.index({ tenantId: 1, user: 1 });
logEventSchema.index({ tenantId: 1, src_ip: 1 });
logEventSchema.index({ source: 1, timestamp: -1 });
logEventSchema.index({ event_type: 1, timestamp: -1 });

logEventSchema.index({
    event_type: 'text',
    user: 'text',
    host: 'text',
    url: 'text'
});


logEventSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('logEvent');
    }
    next();
});

export const LogEvent = mongoose.model<ILogEvent>('LogEvent', logEventSchema);
