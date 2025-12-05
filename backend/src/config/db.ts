import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB(): Promise<void> {
    try {
        const isAtlas = config.MONGO_URI.includes('mongodb+srv');

        await mongoose.connect(config.MONGO_URI, {
            tls: isAtlas,
            tlsAllowInvalidCertificates: isAtlas,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(' MongoDB connected successfully');
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1);
    }
}
