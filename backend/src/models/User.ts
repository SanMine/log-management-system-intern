import mongoose, { Schema, Document } from 'mongoose';
import { getNextSequence } from './Counter';

export interface IUser extends Document {
    id: number;
    email: string;
    passwordHash: string;
    role: 'ADMIN' | 'VIEWER';
    tenantId: number | null;
}

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

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.id = await getNextSequence('user');
    }
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
