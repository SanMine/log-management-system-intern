import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
}
