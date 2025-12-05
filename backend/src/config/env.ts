import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export configuration
export const config = {
    PORT: parseInt(process.env.PORT || '5004', 10),
    MONGO_URI: process.env.MONGO_URI || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
};

// Validate required environment variables
if (!config.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not defined in environment variables');
    process.exit(1);
}
