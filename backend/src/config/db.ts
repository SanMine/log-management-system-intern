import mongoose from 'mongoose';
import { config } from './env';

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.MONGO_URI, {
            // SSL/TLS options for MongoDB Atlas
            tls: true,
            tlsAllowInvalidCertificates: true,  // For development only
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(' MongoDB connected successfully');
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1);
    }
}
