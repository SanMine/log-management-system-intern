import express, { Response } from 'express';
import { AuthRequest, authMiddleware, getTenantFilter } from '../middleware/auth';
import { LogEvent } from '../models/LogEvent';

const router = express.Router();

/**
 * GET /api/logs/search
 * Search and filter logs with pagination
 * 
 * Query params:
 *   - tenant: string (tenant name or ID)
 *   - user: string (optional, "ALL" or specific user)
 *   - from: ISO datetime string (required)
 *   - to: ISO datetime string (required)
 *   - q: string (optional, free-text search query)
 *   - page: number (optional, default 1)
 *   - limit: number (optional, default 50, max 100)
 */
router.get('/search', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        // Parse and validate query parameters
        const {
            tenant,
            user,
            from,
            to,
            q,
            page = '1',
            limit = '50'
        } = req.query;

        // Validate required params
        if (!tenant || !from || !to) {
            res.status(400).json({
                error: 'Missing required parameters: tenant, from, to'
            });
            return;
        }

        // Parse dates
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            res.status(400).json({
                error: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)'
            });
            return;
        }

        // Parse pagination
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;

        // Build MongoDB query
        const query: any = {
            timestamp: {
                $gte: fromDate,
                $lte: toDate
            }
        };

        // Apply RBAC tenant filtering
        // Convert tenant name to ID if needed, or use 'all' for admin
        let tenantFilter: number | null;

        if (tenant === 'all' || tenant === 'ALL') {
            // Admin viewing all tenants
            tenantFilter = getTenantFilter(req.user, 'all');
        } else {
            // Convert tenant name/ID to numeric ID
            const tenantNum = parseInt(tenant as string, 10);
            if (!isNaN(tenantNum)) {
                // Already a number
                tenantFilter = getTenantFilter(req.user, String(tenantNum));
            } else {
                // It's a tenant name, need to look it up
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

        // Filter by user if specified and not "ALL"
        if (user && user !== 'ALL' && user !== 'all') {
            query.user = user;
        }

        // Apply free-text search if query provided
        if (q && (q as string).trim() !== '') {
            const searchTerm = (q as string).trim();
            const searchRegex = new RegExp(searchTerm, 'i'); // case-insensitive

            // Build $or array for string fields
            const orConditions: any[] = [
                { user: searchRegex },
                { src_ip: searchRegex },
                { dst_ip: searchRegex },
                { event_type: searchRegex },
                { action: searchRegex },
                { host: searchRegex },
                { process: searchRegex },
                { url: searchRegex },
                // Search in raw data (stringified)
                { 'raw.message': searchRegex },
                { 'raw.reason': searchRegex },
            ];

            // For status_code (number field), only search if term is numeric
            const statusCodeNum = parseInt(searchTerm, 10);
            if (!isNaN(statusCodeNum)) {
                orConditions.push({ status_code: statusCodeNum });
            }

            query.$or = orConditions;
        }

        // Execute query with pagination
        const [logs, total] = await Promise.all([
            LogEvent.find(query)
                .sort({ timestamp: -1 }) // Most recent first
                .skip(skip)
                .limit(limitNum)
                .lean(),
            LogEvent.countDocuments(query)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limitNum);
        const hasMore = pageNum < totalPages;

        // Send response
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
