import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * Extended Request interface to include user data
 */
export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: 'ADMIN' | 'VIEWER';
        tenantId: number | null;
    };
}

/**
 * JWT payload interface
 */
interface JWTPayload {
    id: number;
    role: 'ADMIN' | 'VIEWER';
    tenantId: number | null;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

        // Attach user data to request
        req.user = {
            id: decoded.id,
            role: decoded.role,
            tenantId: decoded.tenantId,
        };

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Middleware to require specific roles
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: ('ADMIN' | 'VIEWER')[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
}

/**
 * Apply tenant filter based on user role
 * Admin: can filter by any tenant
 * Viewer: locked to their own tenantId
 */
export function getTenantFilter(
    user: AuthRequest['user'],
    requestedTenantId?: number | string
): number | null {
    if (!user) return null;

    // Viewer: always use their own tenantId
    if (user.role === 'VIEWER') {
        return user.tenantId;
    }

    // Admin: use requested tenant or null for "all"
    if (requestedTenantId === undefined || requestedTenantId === 'all') {
        return null; // null means "all tenants"
    }

    return Number(requestedTenantId);
}
