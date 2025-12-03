import express, { Request, Response } from 'express';
import multer from 'multer';
import { LogEvent } from '../models/LogEvent';
import { normalizeLog } from '../normalizers';
import * as alertService from '../services/alertService';

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'));
        }
    },
});

/**
 * POST /api/ingest/file
 * Upload and ingest a JSON file containing an array of logs
 * 
 * Supports all log sources: api, firewall, network, crowdstrike, aws, m365, ad
 * 
 * Each log in the array should have:
 * - tenant: string (required)
 * - source: string (required)
 * - Additional fields based on source type
 */
router.post('/file', upload.single('file'), async (req: Request, res: Response) => {
    try {
        // ==================================
        // STEP 1: Validate file upload
        // ==================================
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No file uploaded',
                message: 'Please upload a JSON file with field name "file"',
            });
            return;
        }

        // ==================================
        // STEP 2: Parse JSON file
        // ==================================
        let logs: any[];
        try {
            const fileContent = req.file.buffer.toString('utf-8');
            logs = JSON.parse(fileContent);
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Invalid JSON',
                message: 'File content is not valid JSON',
            });
            return;
        }

        // ==================================
        // STEP 3: Validate array format
        // ==================================
        if (!Array.isArray(logs)) {
            res.status(400).json({
                success: false,
                error: 'Invalid format',
                message: 'JSON file must contain an array of log objects',
            });
            return;
        }

        if (logs.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Empty array',
                message: 'JSON file contains an empty array',
            });
            return;
        }

        // ==================================
        // STEP 4: Normalize and insert logs
        // ==================================
        const results = {
            total: logs.length,
            success: 0,
            failed: 0,
            errors: [] as any[]
        };

        const normalizedLogs: any[] = [];

        console.log(`📂 Processing ${logs.length} logs from file...`);

        // Process each log through the unified normalizer
        for (let i = 0; i < logs.length; i++) {
            const rawLog = logs[i];

            try {
                // Use unified normalization pipeline
                const normalized = await normalizeLog(rawLog);
                normalizedLogs.push(normalized);
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    index: i,
                    error: error.message,
                    log: rawLog
                });
                console.error(`❌ Failed to normalize log at index ${i}:`, error.message);
                // Continue processing other logs
            }
        }

        // ==================================
        // STEP 5: Bulk insert to database
        // ==================================
        let insertedDocs: any[] = [];

        if (normalizedLogs.length > 0) {
            try {
                insertedDocs = await LogEvent.insertMany(normalizedLogs);
                console.log(`✅ Inserted ${insertedDocs.length} logs into database`);
            } catch (error: any) {
                console.error('Database insert error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Database insertion failed',
                    message: error.message,
                    results
                });
                return;
            }
        }

        // ==================================
        // STEP 6: Process alerts
        // ==================================
        console.log(`🔍 Processing ${insertedDocs.length} events for alert detection...`);

        for (const doc of insertedDocs) {
            try {
                await alertService.processEvent(doc);
            } catch (error: any) {
                console.error('Alert processing error:', error.message);
                // Don't fail the whole batch if alert processing fails
            }
        }

        // ==================================
        // STEP 7: Return response
        // ==================================
        const statusCode = results.failed === 0 ? 201 : 207; // 207 = Multi-Status

        res.status(statusCode).json({
            success: results.failed === 0,
            message: results.failed === 0
                ? `Successfully ingested ${results.success} logs`
                : `Partially successful: ${results.success} ingested, ${results.failed} failed`,
            results: {
                total: results.total,
                inserted: results.success,
                failed: results.failed,
                errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined // Limit errors in response
            }
        });

    } catch (error: any) {
        console.error('File ingestion error:', error);
        res.status(500).json({
            success: false,
            error: 'File ingestion failed',
            message: error.message,
        });
    }
});

export default router;
