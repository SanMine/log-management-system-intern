import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export configuration
export const config = {
    PORT: process.env.PORT || '5004',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_me',
};

// Validate required environment variables
if (!config.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not defined in environment variables');
    process.exit(1);
}
