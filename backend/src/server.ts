import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import ingestRoutes from './routes/ingestRoutes';
import ingestFileRoutes from './routes/ingestFileRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import alertsRoutes from './routes/alertsRoutes';
import usersRoutes from './routes/usersRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import logsRoutes from './routes/logsRoutes';

const app = express();

app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/ingest', ingestFileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/logs', logsRoutes);

app.use(errorHandler);

async function startServer() {
    try {
        await connectDB();

        app.listen(config.PORT, () => {
            console.log(` Server running on port ${config.PORT}`);
            console.log(` Dashboard API: http://localhost:${config.PORT}/api/dashboard`);
            console.log(` Frontend CORS: ${config.FRONTEND_URL}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
