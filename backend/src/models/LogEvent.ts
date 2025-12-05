import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';
import { LogSource } from '../types/CentralLog';

/**
 * LogEvent interface - Normalized log structure following Central Schema
 */
export interface ILogEvent extends Document {
    // Core fields
    id: number;                    // Auto-increment numeric ID
    timestamp: Date;               // Event timestamp
    tenantId: number;             // Link to Tenant.id
    source: LogSource;            // Log source type

    // Vendor & Product
    vendor?: string;              // Vendor name
    product?: string;             // Product name

    // Event classification
    event_type: string;           // Primary event type
    event_subtype?: string;       // Additional classification
    severity?: number;            // Severity (0-10)
    action?: string;              // Action taken

    // Network fields
    src_ip?: string;              // Source IP
    src_port?: number;            // Source port
    dst_ip?: string;              // Destination IP
    dst_port?: number;            // Destination port
    protocol?: string;            // Network protocol

    // Identity & Host
    user?: string;                // Username
    host?: string;                // Hostname
    process?: string;             // Process name

    // Web/HTTP
    url?: string;                 // URL
    http_method?: string;         // HTTP method
    status_code?: number;         // HTTP status

    // Security/Firewall
    rule_name?: string;           // Rule name
    rule_id?: string;             // Rule ID

    // Cloud (nested object matching CentralLog)
    cloud?: {
        account_id?: string;
        region?: string;
        service?: string;
    };

    // Raw & metadata
    raw: any;                     // Original log data
    tags?: string[];              // Custom tags
}

/**
 * LogEvent Mongoose schema
 */
const logEventSchema = new Schema<ILogEvent>(
    {
        id: { type: Number, unique: true },
        timestamp: { type: Date, required: true, default: Date.now, index: true },
        tenantId: { type: Number, required: true, index: true },
        source: { type: String, required: true, index: true },

        // Vendor & Product
        vendor: { type: String },
        product: { type: String },

        // Event classification
        event_type: { type: String, required: true, index: true },
        event_subtype: { type: String },
        severity: { type: Number, min: 0, max: 10 },
        action: { type: String },

        // Network fields
        src_ip: { type: String, index: true },
        src_port: { type: Number },
        dst_ip: { type: String },
        dst_port: { type: Number },
        protocol: { type: String },

        // Identity & Host
        user: { type: String, index: true },
        host: { type: String },
        process: { type: String },

        // Web/HTTP
        url: { type: String },
        http_method: { type: String },
        status_code: { type: Number },

        // Security/Firewall
        rule_name: { type: String },
        rule_id: { type: String },

        // Cloud (nested object)
        cloud: {
            account_id: { type: String },
            region: { type: String },
            service: { type: String }
        },

        // Raw & metadata
        raw: { type: Schema.Types.Mixed },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

// ========================================
// INDEXES FOR SEARCHABILITY
// ========================================

// Compound indexes for common query patterns
logEventSchema.index({ tenantId: 1, timestamp: -1 });
logEventSchema.index({ tenantId: 1, event_type: 1 });
logEventSchema.index({ tenantId: 1, user: 1 });
logEventSchema.index({ tenantId: 1, src_ip: 1 });
logEventSchema.index({ source: 1, timestamp: -1 });
logEventSchema.index({ event_type: 1, timestamp: -1 });

// Text search index for full-text searching
logEventSchema.index({
    event_type: 'text',
    user: 'text',
    host: 'text',
    url: 'text'
});

// ========================================
// PRE-SAVE HOOK
// ========================================

// Auto-increment numeric ID before saving
logEventSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('logEvent');
    }
    next();
});

export const LogEvent = mongoose.model<ILogEvent>('LogEvent', logEventSchema);
