import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

/**
 * Tenant interface
 */
export interface ITenant extends Document {
    id: number; // Auto-increment numeric ID
    name: string; // e.g., "A.website.com"
    key: string; // Short key, e.g., "A"
}

/**
 * Tenant schema
 */
const tenantSchema = new Schema<ITenant>(
    {
        id: { type: Number, unique: true },
        name: { type: String, required: true, unique: true },
        key: { type: String, required: true },
    },
    { timestamps: true }
);

// Auto-increment id before saving
tenantSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('tenant');
    }
    next();
});

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
