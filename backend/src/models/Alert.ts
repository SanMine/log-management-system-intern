import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

export interface IAlert extends Document {
    id: number;
    tenantId: number;
    time: Date;
    ruleName: string;
    ip?: string;
    user?: string;
    involved_ips?: string[];
    count: number;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    last_event_time: Date;
    resolved_at?: Date;
}

const alertSchema = new Schema<IAlert>(
    {
        id: { type: Number, unique: true },
        tenantId: { type: Number, required: true, index: true },
        time: { type: Date, required: true, default: Date.now, index: true },
        ruleName: { type: String, required: true },
        ip: { type: String },
        user: { type: String },
        involved_ips: [{ type: String }],
        count: { type: Number, required: true, default: 1 },
        status: {
            type: String,
            enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
            default: 'OPEN',
        },
        last_event_time: { type: Date, required: true, default: Date.now },
        resolved_at: { type: Date },
    },
    { timestamps: true }
);

alertSchema.index({ tenantId: 1, time: -1 });

alertSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('alert');
    }
    next();
});

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
