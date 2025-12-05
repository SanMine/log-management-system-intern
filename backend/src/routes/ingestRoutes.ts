import express, { Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { createLogEvent } from '../services/logService';

const router = express.Router();

/**
 * POST /api/ingest/http
 * Ingest logs via HTTP - supports all log sources
 *
 * Body examples:
 * 
 * API log:
 * {
 *   "tenant": "demo.com",
 *   "source": "api",
 *   "event_type": "login_failed",
 *   "user": "alice",
 *   "ip": "203.0.113.7"
 * }
 * 
 * Firewall syslog:
 * {
 *   "tenant": "demo.com",
 *   "source": "firewall",
 *   "raw": "<134>Aug 20 12:44:56 fw01 vendor=demo action=deny src=10.0.1.10 dst=8.8.8.8"
 * }
 * 
 * Supported sources: api, firewall, network, crowdstrike, aws, m365, ad
 */
router.post('/http', async (req: AuthRequest, res: Response) => {
    try {
        // Unified normalization pipeline handles all sources
        const logEvent = await createLogEvent(req.body);

        res.status(201).json({
            success: true,
            id: logEvent.id,
            source: logEvent.source,
            message: 'Log event ingested successfully',
        });
    } catch (error: any) {
        console.error('Ingest error:', error);

        // Determine appropriate status code
        const statusCode = getErrorStatusCode(error.message);

        res.status(statusCode).json({
            success: false,
            error: 'Failed to ingest log event',
            message: error.message,
        });
    }
});

/**
 * Determine HTTP status code based on error message
 */
/**
 * POST /api/ingest/batch
 * Ingest multiple logs at once via HTTP
 *
 * Body: Array of log objects
 * [
 *   { "tenant": "demo.com", "source": "api", "event_type": "login", ... },
 *   { "tenant": "demo.com", "source": "api", "event_type": "logout", ... }
 * ]
 */
router.post('/batch', async (req: AuthRequest, res: Response) => {
    try {
        // Validate that body is an array
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

        // Process all logs
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

        // Return summary
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
        return 400; // Bad Request
    }
    if (errorMessage.includes('Unsupported log source')) {
        return 400; // Bad Request
    }
    if (errorMessage.includes('Tenant')) {
        return 404; // Not Found (if not auto-creating)
    }
    return 422; // Unprocessable Entity (generic validation error)
}

export default router;
