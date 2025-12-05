import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { getAlerts, updateAlertStatus } from '../services/alertService';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const requestedTenantId = req.query.tenantId as string | undefined;
        const status = req.query.status as string | undefined;
        const timeRange = req.query.timeRange as string | undefined;

        const tenantId = getTenantFilter(req.user, requestedTenantId);

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

router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'VIEWER') {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Only viewer accounts can update alert status. Super admin has read-only access.'
            });
            return;
        }

        const alertId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!status || !['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
            res.status(400).json({ error: 'Invalid status. Must be OPEN, INVESTIGATING, or RESOLVED' });
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
