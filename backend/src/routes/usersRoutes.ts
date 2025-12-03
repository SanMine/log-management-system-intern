import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { LogEvent } from '../models/LogEvent';
import { getUserActivity } from '../services/userActivityService';

const router = express.Router();

/**
 * GET /api/users
 * Get list of users (filtered by tenant based on RBAC)
 *
 * Query params:
 *   - tenantId?: number | "all"
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;

        // Apply RBAC tenant filtering
        const tenantId = getTenantFilter(req.user, requestedTenantId);

        // Build query
        const query: any = {};
        if (tenantId !== null) {
            query.tenantId = tenantId;
        }

        // Get distinct users
        const users = await LogEvent.distinct('user', query);

        res.json(users.filter((u) => u)); // Filter out null/undefined
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/users/:username/activity
 * Get activity for a specific user
 *
 * Query params:
 *   - tenantId?: number | "all"
 *   - timeRange?: "15m" | "1h" | "24h" | "7d"
 */
router.get('/:username/activity', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const username = req.params.username;
        const requestedTenantId = req.query.tenantId as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        // Apply RBAC tenant filtering
        const tenantId = getTenantFilter(req.user, requestedTenantId);

        // Get user activity
        const activity = await getUserActivity(username, tenantId, timeRange);

        res.json(activity);
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

export default router;
