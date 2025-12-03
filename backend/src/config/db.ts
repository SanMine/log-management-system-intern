import mongoose from 'mongoose';
import { config } from './env';

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}
