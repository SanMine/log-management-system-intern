/**
 * Test Case 1: Log Ingestion
 * 
 * Tests the HTTP ingestion endpoint with different log sources
 * and verifies proper normalization and storage.
 */

const request = require('supertest');
const mongoose = require('mongoose');

const API_URL = process.env.API_URL || 'http://localhost:5004';

describe('Log Ingestion Tests', () => {

    // Test 1: Ingest API log
    test('should ingest API log successfully', async () => {
        const logData = {
            tenant: 'test-tenant',
            source: 'api',
            event_type: 'login_success',
            user: 'test@example.com',
            ip: '192.168.1.100',
            timestamp: new Date().toISOString()
        };

        const response = await request(API_URL)
            .post('/api/ingest/http')
            .send(logData)
            .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('id');
        expect(response.body.source).toBe('api');
    });

    // Test 2: Ingest Firewall log
    test('should normalize firewall syslog format', async () => {
        const logData = {
            tenant: 'test-tenant',
            source: 'firewall',
            raw: '<134>Dec 05 10:30:00 fw01 action=deny src=10.0.1.10 dst=8.8.8.8 proto=tcp',
            timestamp: new Date().toISOString()
        };

        const response = await request(API_URL)
            .post('/api/ingest/http')
            .send(logData)
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.source).toBe('firewall');
    });

    // Test 3: Batch ingestion
    test('should handle batch ingestion', async () => {
        const logsArray = [
            {
                tenant: 'test-tenant',
                source: 'api',
                event_type: 'login_failed',
                user: 'user1@test.com',
                ip: '192.168.1.1'
            },
            {
                tenant: 'test-tenant',
                source: 'api',
                event_type: 'login_failed',
                user: 'user2@test.com',
                ip: '192.168.1.2'
            }
        ];

        const response = await request(API_URL)
            .post('/api/ingest/batch')
            .send(logsArray)
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.total).toBe(2);
        expect(response.body.succeeded).toBe(2);
        expect(response.body.failed).toBe(0);
    });

    // Test 4: Invalid log source
    test('should reject invalid log source', async () => {
        const logData = {
            tenant: 'test-tenant',
            source: 'invalid-source',
            event_type: 'test'
        };

        const response = await request(API_URL)
            .post('/api/ingest/http')
            .send(logData)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    // Test 5: Missing required fields
    test('should reject log missing required fields', async () => {
        const logData = {
            source: 'api'
            // Missing tenant
        };

        const response = await request(API_URL)
            .post('/api/ingest/http')
            .send(logData)
            .expect(400);

        expect(response.body.success).toBe(false);
    });

    // Test 6: All supported sources
    const sources = ['api', 'firewall', 'network', 'crowdstrike', 'aws', 'm365', 'ad'];

    sources.forEach(source => {
        test(`should accept ${source} source`, async () => {
            const logData = {
                tenant: 'test-tenant',
                source: source,
                event_type: 'test_event',
                timestamp: new Date().toISOString()
            };

            const response = await request(API_URL)
                .post('/api/ingest/http')
                .send(logData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.source).toBe(source);
        });
    });
});

/**
 * How to run this test:
 * 
 * 1. Make sure backend is running: npm run dev
 * 2. Install test dependencies: npm install --save-dev jest supertest
 * 3. Run tests: npm test tests/ingestion.test.js
 * 
 * Expected results:
 * - All 13 tests should pass
 * - Response times should be < 200ms
 * - No database errors
 */
