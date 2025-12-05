import express, { Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { createLogEvent } from '../services/logService';

const router = express.Router();

router.post('/http', async (req: AuthRequest, res: Response) => {
    try {
        const logEvent = await createLogEvent(req.body);

        res.status(201).json({
            success: true,
            id: logEvent.id,
            source: logEvent.source,
            message: 'Log event ingested successfully',
        });
    } catch (error: any) {
        console.error('Ingest error:', error);

        const statusCode = getErrorStatusCode(error.message);

        res.status(statusCode).json({
            success: false,
            error: 'Failed to ingest log event',
            message: error.message,
        });
    }
});

router.post('/batch', async (req: AuthRequest, res: Response) => {
    try {
        if (!Array.isArray(req.body)) {
            res.status(400).json({
                success: false,
                error: 'Request body must be an array of log objects',
            });
            return;
        }

        if (req.body.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Array cannot be empty',
            });
            return;
        }

        const results = [];
        const errors = [];

        for (let i = 0; i < req.body.length; i++) {
            try {
                const logEvent = await createLogEvent(req.body[i]);
                results.push({
                    index: i,
                    success: true,
                    id: logEvent.id,
                    source: logEvent.source,
                });
            } catch (error: any) {
                errors.push({
                    index: i,
                    success: false,
                    error: error.message,
                });
            }
        }

        res.status(201).json({
            success: errors.length === 0,
            total: req.body.length,
            succeeded: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('Batch ingest error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process batch ingestion',
            message: error.message,
        });
    }
});

function getErrorStatusCode(errorMessage: string): number {
    if (errorMessage.includes('Missing required field')) {
        return 400;
    }
    if (errorMessage.includes('Unsupported log source')) {
        return 400;
    }
    if (errorMessage.includes('Tenant')) {
        return 404;
    }
    return 422;
}

export default router;
