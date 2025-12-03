import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { getDashboardData } from '../services/dashboardService';

const router = express.Router();

/**
 * GET /api/dashboard
 * Get dashboard statistics
 *
 * Query params:
 *   - tenantId?: number | "all"
 *   - timeRange?: "15m" | "1h" | "24h" | "7d"
 *
 * Response: {
 *   totalEvents: number,
 *   uniqueIps: number,
 *   uniqueUsers: number,
 *   totalAlerts: number,
 *   eventsOverTime: [{ time, count }],
 *   topIps: [{ ip, count }],
 *   topUsers: [{ user, count }],
 *   topEventTypes: [{ event_type, count }]
 * }
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        // Apply RBAC tenant filtering
        const tenantId = getTenantFilter(req.user, requestedTenantId);

        // Get dashboard data
        const data = await getDashboardData(tenantId, timeRange);

        res.json(data);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;
