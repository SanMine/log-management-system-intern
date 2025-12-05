import express, { Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
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
        // Accept both JSON and CSV files
        const allowedMimeTypes = ['application/json', 'text/csv', 'application/csv'];
        const allowedExtensions = ['.json', '.csv'];

        const hasValidMime = allowedMimeTypes.includes(file.mimetype);
        const hasValidExtension = allowedExtensions.some(ext =>
            file.originalname.toLowerCase().endsWith(ext)
        );

        if (hasValidMime || hasValidExtension) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON and CSV files are allowed'));
        }
    },
});

/**
 * Parse CSV file and convert to array of objects
 */
function parseCsvFile(fileContent: string): any[] {
    try {
        const records = parse(fileContent, {
            columns: true,          // Use first row as headers
            skip_empty_lines: true, // Skip empty lines
            trim: true,             // Trim whitespace
            cast: true,             // Auto-cast values (numbers, booleans)
        });

        return records;
    } catch (error: any) {
        throw new Error(`CSV parsing failed: ${error.message}`);
    }
}

/**
 * POST /api/ingest/file
 * Upload and ingest a JSON or CSV file containing logs
 * 
 * Supported formats:
 * - JSON: Array of log objects
 * - CSV: Headers in first row, one log per row
 * 
 * Supports all log sources: api, firewall, network, crowdstrike, aws, m365, ad
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
                message: 'Please upload a JSON or CSV file with field name "file"',
            });
            return;
        }

        const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
        const isJson = fileExtension === 'json';
        const isCsv = fileExtension === 'csv';

        // ==================================
        // STEP 2: Parse file based on type
        // ==================================
        let logs: any[];
        const fileContent = req.file.buffer.toString('utf-8');

        try {
            if (isJson) {
                // Parse JSON
                logs = JSON.parse(fileContent);

                if (!Array.isArray(logs)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid format',
                        message: 'JSON file must contain an array of log objects',
                    });
                    return;
                }
            } else if (isCsv) {
                // Parse CSV
                logs = parseCsvFile(fileContent);
                console.log(` Parsed ${logs.length} rows from CSV file`);
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Unsupported file type',
                    message: 'Please upload a JSON or CSV file',
                });
                return;
            }
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: isJson ? 'Invalid JSON' : 'Invalid CSV',
                message: error.message || `File content is not valid ${fileExtension?.toUpperCase()}`,
            });
            return;
        }

        // ==================================
        // STEP 3: Validate array is not empty
        // ==================================
        if (logs.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Empty file',
                message: 'File contains no log entries',
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

        console.log(` Processing ${logs.length} logs from ${fileExtension?.toUpperCase()} file...`);

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
                    row: i + 1, // 1-indexed for user
                    error: error.message,
                    log: rawLog
                });
                console.error(` Failed to normalize log at row ${i + 1}:`, error.message);
                // Continue processing other logs
            }
        }

        // ==================================
        // STEP 5: Generate IDs and bulk insert to database
        // ==================================
        let insertedDocs: any[] = [];

        if (normalizedLogs.length > 0) {
            try {
                // IMPORTANT: insertMany() doesn't trigger pre-save hooks
                // So we need to manually generate IDs before insertion
                const { getNextSequence } = await import('../models/Counter');

                for (const log of normalizedLogs) {
                    log.id = await getNextSequence('logEvent');
                }

                insertedDocs = await LogEvent.insertMany(normalizedLogs);
                console.log(` Inserted ${insertedDocs.length} logs into database`);
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
        console.log(` Processing ${insertedDocs.length} events for alert detection...`);

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
                ? `Successfully ingested ${results.success} logs from ${fileExtension?.toUpperCase()} file`
                : `Partially successful: ${results.success} ingested, ${results.failed} failed`,
            fileType: fileExtension,
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
