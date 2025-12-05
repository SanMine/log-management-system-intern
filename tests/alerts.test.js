/**
 * Test Case 2: Alert Detection and Resolution
 * 
 * Tests the alert engine rules:
 * - Rule 1: Multiple failed logins from same IP
 * - Rule 2: Distributed attack from multiple IPs
 * - Auto-resolution on successful login
 */

const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:5004';
const TENANT = 'alert-test-tenant';

describe('Alert Detection Tests', () => {

    // Helper function to send log
    const sendLog = async (logData) => {
        return await request(API_URL)
            .post('/api/ingest/http')
            .send({ tenant: TENANT, ...logData });
    };

    // Helper function to get alerts
    const getAlerts = async (tenantId) => {
        return await request(API_URL)
            .get(`/api/alerts?tenant=${tenantId}`)
            .expect(200);
    };

    // Test 1: Trigger Rule 1 - Multiple Failed Logins
    test('should create alert after 3 failed logins from same IP', async () => {
        const user = 'victim@test.com';
        const ip = '192.168.1.99';

        // Send 3 failed login attempts
        for (let i = 0; i < 3; i++) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip,
                timestamp: new Date().toISOString()
            });

            // Small delay between attempts
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for alert processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check alerts were created
        const response = await getAlerts(TENANT);
        const alerts = response.body;

        const multipleFailedAlert = alerts.find(a =>
            a.ruleName === 'Multiple Failed Login Attempts' &&
            a.user === user &&
            a.ip === ip
        );

        expect(multipleFailedAlert).toBeDefined();
        expect(multipleFailedAlert.count).toBeGreaterThanOrEqual(3);
        expect(multipleFailedAlert.status).toBe('OPEN');
    });

    // Test 2: Trigger Rule 2 - Distributed Attack
    test('should detect distributed attack from multiple IPs', async () => {
        const user = 'target@test.com';
        const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4'];

        // Send failed logins from different IPs
        for (const ip of ips) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip,
                timestamp: new Date().toISOString()
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Wait for alert processing
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await getAlerts(TENANT);
        const alerts = response.body;

        const distributedAlert = alerts.find(a =>
            a.ruleName === 'Distributed Failed Login Attack' &&
            a.user === user
        );

        expect(distributedAlert).toBeDefined();
        expect(distributedAlert.count).toBeGreaterThanOrEqual(3);
        expect(distributedAlert.involved_ips).toBeDefined();
        expect(distributedAlert.involved_ips.length).toBeGreaterThanOrEqual(3);
    });

    // Test 3: Auto-resolution on successful login
    test('should auto-resolve alerts on successful login', async () => {
        const user = 'resolver@test.com';
        const ip = '172.16.0.1';

        // Create failed login alerts
        for (let i = 0; i < 3; i++) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify alert exists
        let response = await getAlerts(TENANT);
        let alerts = response.body.filter(a => a.user === user && a.status === 'OPEN');
        expect(alerts.length).toBeGreaterThan(0);

        // Send successful login
        await sendLog({
            source: 'api',
            event_type: 'login_success',
            user: user,
            ip: ip
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Check alerts are resolved
        response = await getAlerts(TENANT);
        alerts = response.body.filter(a => a.user === user && a.status === 'OPEN');
        expect(alerts.length).toBe(0);

        const resolvedAlerts = response.body.filter(a =>
            a.user === user && a.status === 'RESOLVED'
        );
        expect(resolvedAlerts.length).toBeGreaterThan(0);
    });

    // Test 4: Alert not triggered with less than threshold
    test('should NOT create alert with only 2 failed logins', async () => {
        const user = 'safe@test.com';
        const ip = '192.168.2.1';

        // Send only 2 failed logins (below threshold)
        for (let i = 0; i < 2; i++) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await getAlerts(TENANT);
        const alerts = response.body.filter(a => a.user === user);

        // Should have no alerts for this user
        expect(alerts.length).toBe(0);
    });

    // Test 5: Alert update (not duplicate)
    test('should update existing alert instead of creating duplicate', async () => {
        const user = 'updater@test.com';
        const ip = '203.0.113.1';

        // Send 3 failed logins to create alert
        for (let i = 0; i < 3; i++) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        let response = await getAlerts(TENANT);
        const initialAlerts = response.body.filter(a => a.user === user);
        const initialCount = initialAlerts.length;

        // Send 2 more failed logins
        for (let i = 0; i < 2; i++) {
            await sendLog({
                source: 'api',
                event_type: 'login_failed',
                user: user,
                ip: ip
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        response = await getAlerts(TENANT);
        const updatedAlerts = response.body.filter(a => a.user === user);

        // Should still have same number of alerts (updated, not new)
        expect(updatedAlerts.length).toBe(initialCount);

        // But count should be higher
        if (updatedAlerts.length > 0) {
            expect(updatedAlerts[0].count).toBeGreaterThan(3);
        }
    });
});

/**
 * How to run this test:
 * 
 * 1. Make sure backend is running: npm run dev
 * 2. Install test dependencies: npm install --save-dev jest supertest
 * 3. Run tests: npm test tests/alerts.test.js
 * 
 * Expected results:
 * - All 5 tests should pass
 * - Alerts should be created within 1 second
 * - Auto-resolution should work correctly
 */
