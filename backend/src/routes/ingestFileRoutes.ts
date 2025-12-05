import express, { Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { LogEvent } from '../models/LogEvent';
import { normalizeLog } from '../normalizers';
import * as alertService from '../services/alertService';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
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

function parseCsvFile(fileContent: string): any[] {
    try {
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            cast: true,
        });

        return records;
    } catch (error: any) {
        throw new Error(`CSV parsing failed: ${error.message}`);
    }
}

router.post('/file', upload.single('file'), async (req: Request, res: Response) => {
    try {
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

        let logs: any[];
        const fileContent = req.file.buffer.toString('utf-8');

        try {
            if (isJson) {
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

        if (logs.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Empty file',
                message: 'File contains no log entries',
            });
            return;
        }

        const results = {
            total: logs.length,
            success: 0,
            failed: 0,
            errors: [] as any[]
        };

        const normalizedLogs: any[] = [];

        console.log(` Processing ${logs.length} logs from ${fileExtension?.toUpperCase()} file...`);

        for (let i = 0; i < logs.length; i++) {
            const rawLog = logs[i];

            try {
                const normalized = await normalizeLog(rawLog);
                normalizedLogs.push(normalized);
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    index: i,
                    row: i + 1,
                    error: error.message,
                    log: rawLog
                });
                console.error(` Failed to normalize log at row ${i + 1}:`, error.message);
            }
        }

        let insertedDocs: any[] = [];

        if (normalizedLogs.length > 0) {
            try {
                // Use save() to trigger pre-save hook for consistent ID assignment
                for (const log of normalizedLogs) {
                    const logEvent = new LogEvent(log);
                    await logEvent.save();
                    insertedDocs.push(logEvent);
                }
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

        console.log(` Processing ${insertedDocs.length} events for alert detection...`);

        for (const doc of insertedDocs) {
            try {
                await alertService.processEvent(doc);
            } catch (error: any) {
                console.error('Alert processing error:', error.message);
            }
        }

        const statusCode = results.failed === 0 ? 201 : 207;

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
                errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined
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
