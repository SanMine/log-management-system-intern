import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { LogEvent } from '../models/LogEvent';
import { getUserActivity } from '../services/userActivityService';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;

        const tenantId = getTenantFilter(req.user, requestedTenantId);

        const query: any = {};
        if (tenantId !== null) {
            query.tenantId = tenantId;
        }

        const users = await LogEvent.distinct('user', query);

        res.json(users.filter((u) => u));
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/:username/activity', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const username = req.params.username;
        const requestedTenantId = req.query.tenantId as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        const tenantId = getTenantFilter(req.user, requestedTenantId);

        const activity = await getUserActivity(username, tenantId, timeRange);

        res.json(activity);
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

export default router;
