import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: 'ADMIN' | 'VIEWER';
        tenantId: number | null;
    };
}

interface JWTPayload {
    id: number;
    role: 'ADMIN' | 'VIEWER';
    tenantId: number | null;
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

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

export function getTenantFilter(
    user: AuthRequest['user'],
    requestedTenantId?: number | string
): number | null {
    if (!user) return null;

    if (user.role === 'VIEWER') {
        return user.tenantId;
    }

    if (requestedTenantId === undefined || requestedTenantId === 'all') {
        return null;
    }

    return Number(requestedTenantId);
}
