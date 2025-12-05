import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { getDashboardData } from '../services/dashboardService';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        const tenantId = getTenantFilter(req.user, requestedTenantId);

        const data = await getDashboardData(tenantId, timeRange);

        res.json(data);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;
