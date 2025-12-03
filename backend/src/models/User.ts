import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

/**
 * User interface
 */
export interface IUser extends Document {
    id: number; // Auto-increment numeric ID
    email: string;
    passwordHash: string;
    role: 'ADMIN' | 'VIEWER';
    tenantId: number | null; // Admin: null (can see all), Viewer: specific tenant
}

/**
 * User schema
 */
const userSchema = new Schema<IUser>(
    {
        id: { type: Number, unique: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['ADMIN', 'VIEWER'], required: true },
        tenantId: { type: Number, default: null },
    },
    { timestamps: true }
);

// Auto-increment id before saving
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('user');
    }
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
