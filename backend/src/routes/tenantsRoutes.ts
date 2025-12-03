import express, { Response } from 'express';
import { AuthRequest, authMiddleware, requireRole } from '../middleware/auth';
import { Tenant } from '../models/Tenant';

const router = express.Router();

/**
 * GET /api/tenants
 * Get list of tenants
 * Admin: all tenants
 * Viewer: only their own tenant
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        let tenants: any[];

        if (req.user?.role === 'ADMIN') {
            // Admin: get all tenants
            tenants = await Tenant.find().select('id name key');
        } else if (req.user?.tenantId) {
            // Viewer: only their own tenant
            tenants = await Tenant.find({ id: req.user.tenantId }).select('id name key');
        } else {
            tenants = [];
        }

        res.json(tenants);
    } catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

/**
 * POST /api/tenants
 * Create a new tenant (Admin only)
 *
 * Body: { name: string, key: string }
 */
router.post(
    '/',
    authMiddleware,
    requireRole('ADMIN'),
    async (req: AuthRequest, res: Response) => {
        try {
            const { name, key } = req.body;

            if (!name || !key) {
                res.status(400).json({ error: 'Name and key are required' });
                return;
            }

            const tenant = new Tenant({ name, key });
            await tenant.save();

            res.status(201).json(tenant);
        } catch (error: any) {
            console.error('Create tenant error:', error);
            if (error.code === 11000) {
                res.status(400).json({ error: 'Tenant with this name already exists' });
            } else {
                res.status(500).json({ error: 'Failed to create tenant' });
            }
        }
    }
);

/**
 * GET /api/tenants/:id
 * Get a specific tenant
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = parseInt(req.params.id, 10);

        // RBAC: Viewer can only see their own tenant
        if (req.user?.role === 'VIEWER' && req.user.tenantId !== tenantId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const tenant = await Tenant.findOne({ id: tenantId });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        res.json(tenant);
    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
});

export default router;
