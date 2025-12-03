import mongoose, { Schema, Document } from 'mongoose';

/**
 * Counter interface for auto-increment sequences
 */
export interface ICounter extends Document {
    seq: number; // current sequence value
}

/**
 * Counter schema for managing auto-increment sequences
 * Note: _id is String instead of ObjectId for this collection
 */
const counterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

/**
 * Get the next sequence number for a given counter name
 * @param name - Counter name (e.g., "tenant", "user", "logEvent")
 * @returns Next sequence number
 */
export async function getNextSequence(name: string): Promise<number> {
    const counter = await Counter.findByIdAndUpdate(
        name,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter!.seq;
}
