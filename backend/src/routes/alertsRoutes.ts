import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { getAlerts, updateAlertStatus } from '../services/alertService';

const router = express.Router();

/**
 * GET /api/alerts
 * Get alerts with filters
 *
 * Query params:
 *   - tenantId?: number | "all"
 *   - status?: "OPEN" | "INVESTIGATING" | "RESOLVED" | "all"
 *   - timeRange?: "15m" | "1h" | "24h" | "7d"
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;
        const status = req.query.status as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        // Apply RBAC tenant filtering
        const tenantId = getTenantFilter(req.user, requestedTenantId);

        // Get alerts
        const alerts = await getAlerts({
            tenantId,
            status,
            timeRange,
        });

        res.json(alerts);
    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

/**
 * PATCH /api/alerts/:id
 * Update alert status
 *
 * Body: { status: "OPEN" | "INVESTIGATING" | "RESOLVED" }
 */
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const alertId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!status || !['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const updatedAlert = await updateAlertStatus(alertId, status);

        if (!updatedAlert) {
            res.status(404).json({ error: 'Alert not found' });
            return;
        }

        res.json(updatedAlert);
    } catch (error) {
        console.error('Update alert error:', error);
        res.status(500).json({ error: 'Failed to update alert' });
    }
});

export default router;
