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
