import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { LogEvent } from '../models/LogEvent';

const router = express.Router();

router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const {
            tenant,
            user,
            from,
            to,
            q,
            page = '1',
            limit = '50'
        } = req.query;

        if (!tenant || !from || !to) {
            res.status(400).json({
                error: 'Missing required parameters: tenant, from, to'
            });
            return;
        }

        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            res.status(400).json({
                error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)'
            });
            return;
        }

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        const query: any = {
            timestamp: {
                $gte: fromDate,
                $lte: toDate
            }
        };

        let tenantFilter: number | null;

        if (tenant === 'all' || tenant === 'ALL') {
            tenantFilter = getTenantFilter(req.user, 'all');
        } else {
            const tenantNum = parseInt(tenant as string, 10);
            if (!isNaN(tenantNum)) {
                tenantFilter = getTenantFilter(req.user, String(tenantNum));
            } else {
                const { Tenant } = await import('../models/Tenant');
                const tenantDoc = await Tenant.findOne({ name: tenant as string });
                if (tenantDoc) {
                    tenantFilter = getTenantFilter(req.user, String(tenantDoc.id));
                } else {
                    res.status(400).json({
                        error: `Tenant '${tenant}' not found`
                    });
                    return;
                }
            }
        }

        if (tenantFilter !== null) {
            query.tenantId = tenantFilter;
        }

        if (user && user !== 'ALL' && user !== 'all') {
            query.user = user;
        }

        if (q && (q as string).trim() !== '') {
            const searchTerm = (q as string).trim();
            const searchRegex = new RegExp(searchTerm, 'i');

            const orConditions: any[] = [
                { user: searchRegex },
                { src_ip: searchRegex },
                { dst_ip: searchRegex },
                { event_type: searchRegex },
                { action: searchRegex },
                { host: searchRegex },
                { process: searchRegex },
                { url: searchRegex },
                { 'raw.message': searchRegex },
                { 'raw.reason': searchRegex },
            ];

            const statusCodeNum = parseInt(searchTerm, 10);
            if (!isNaN(statusCodeNum)) {
                orConditions.push({ status_code: statusCodeNum });
            }

            query.$or = orConditions;
        }

        const [logs, total] = await Promise.all([
            LogEvent.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            LogEvent.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum);
        const hasMore = pageNum < totalPages;

        res.json({
            data: logs,
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasMore
        });

    } catch (error: any) {
        console.error('Log search error:', error);
        res.status(500).json({
            error: 'Failed to search logs',
            message: error.message
        });
    }
});

export default router;
