import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

export interface ITenant extends Document {
    id: number;
    name: string;
    key: string;
}

const tenantSchema = new Schema<ITenant>(
    {
        id: { type: Number, unique: true },
        name: { type: String, required: true, unique: true },
        key: { type: String, required: true },
    },
    { timestamps: true }
);

tenantSchema.pre('save', async function (next) {
    try {
        if (this.isNew && !this.id) {
            this.id = await getNextSequence('tenant');
        }
        next();
    } catch (error: any) {
        console.error('Error in Tenant pre-save hook:', error);
        next(error);
    }
});

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
