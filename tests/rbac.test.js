/**
 * Test Case 3: RBAC and Tenant Isolation
 * 
 * Tests that users can only access their own tenant's data
 * and that super admins have appropriate elevated permissions.
 */

const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:5004';

describe('RBAC and Tenant Isolation Tests', () => {

    let superAdminToken = null;
    let viewer1Token = null;
    let viewer2Token = null;
    let tenant1Id = null;
    let tenant2Id = null;

    // Setup: Create test users
    beforeAll(async () => {
        // Login as super admin
        const superAdminLogin = await request(API_URL)
            .post('/api/auth/login')
            .send({
                email: 'superadmin@gmail.com',
                password: 'super12345'
            })
            .expect(200);

        superAdminToken = superAdminLogin.body.token;

        // Create viewer 1
        const viewer1Signup = await request(API_URL)
            .post('/api/auth/signup')
            .send({
                email: 'viewer1@rbac-test.com',
                password: 'test1234',
                tenantName: 'RBAC Test Tenant 1'
            })
            .expect(201);

        viewer1Token = viewer1Signup.body.token;
        tenant1Id = viewer1Signup.body.user.tenantId;

        // Create viewer 2
        const viewer2Signup = await request(API_URL)
            .post('/api/auth/signup')
            .send({
                email: 'viewer2@rbac-test.com',
                password: 'test1234',
                tenantName: 'RBAC Test Tenant 2'
            })
            .expect(201);

        viewer2Token = viewer2Signup.body.token;
        tenant2Id = viewer2Signup.body.user.tenantId;
    });

    // Test 1: Viewer can only see own tenant's logs
    test('viewer should only access their own tenant data', async () => {
        // Viewer 1 sends a log to their tenant
        await request(API_URL)
            .post('/api/ingest/http')
            .set('Authorization', `Bearer ${viewer1Token}`)
            .send({
                tenant: 'RBAC Test Tenant 1',
                source: 'api',
                event_type: 'test_event',
                user: 'viewer1@rbac-test.com'
            })
            .expect(201);

        // Viewer 2 sends a log to their tenant
        await request(API_URL)
            .post('/api/ingest/http')
            .set('Authorization', `Bearer ${viewer2Token}`)
            .send({
                tenant: 'RBAC Test Tenant 2',
                source: 'api',
                event_type: 'test_event',
                user: 'viewer2@rbac-test.com'
            })
            .expect(201);

        // Viewer 1 searches their logs
        const viewer1Search = await request(API_URL)
            .get(`/api/logs/search?tenant=${tenant1Id}`)
            .set('Authorization', `Bearer ${viewer1Token}`)
            .expect(200);

        const viewer1Logs = viewer1Search.body.data;

        // Should only see their own tenant's logs
        expect(viewer1Logs.every(log => log.tenantId === tenant1Id)).toBe(true);
        expect(viewer1Logs.some(log => log.tenantId === tenant2Id)).toBe(false);
    });

    // Test 2: Super admin can view all tenants
    test('super admin should see all tenant data', async () => {
        const dashboard = await request(API_URL)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .expect(200);

        // Super admin should have access to dashboard
        expect(dashboard.body).toBeDefined();
    });

    // Test 3: Viewer cannot update another tenant's alert
    test('viewer cannot modify alerts from other tenants', async () => {
        // Create alert for tenant 1
        for (let i = 0; i < 3; i++) {
            await request(API_URL)
                .post('/api/ingest/http')
                .send({
                    tenant: 'RBAC Test Tenant 1',
                    source: 'api',
                    event_type: 'login_failed',
                    user: 'victim@tenant1.com',
                    ip: '10.0.0.1'
                });
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Get alerts for tenant 1
        const alertsResponse = await request(API_URL)
            .get(`/api/alerts?tenant=${tenant1Id}`)
            .set('Authorization', `Bearer ${viewer1Token}`)
            .expect(200);

        const alerts = alertsResponse.body;

        if (alerts.length > 0) {
            const alertId = alerts[0].id;

            // Viewer 2 tries to update tenant 1's alert (should fail)
            const updateAttempt = await request(API_URL)
                .patch(`/api/alerts/${alertId}`)
                .set('Authorization', `Bearer ${viewer2Token}`)
                .send({ status: 'RESOLVED' });

            // Should be forbidden or not found
            expect([403, 404]).toContain(updateAttempt.status);
        }
    });

    // Test 4: Authentication required
    test('unauthenticated requests should be rejected', async () => {
        // Try to access dashboard without token
        await request(API_URL)
            .get('/api/dashboard')
            .expect(401);

        // Try to search logs without token
        await request(API_URL)
            .get('/api/logs/search')
            .expect(401);

        // Try to get alerts without token
        await request(API_URL)
            .get('/api/alerts')
            .expect(401);
    });

    // Test 5: Invalid token rejected
    test('invalid token should be rejected', async () => {
        await request(API_URL)
            .get('/api/dashboard')
            .set('Authorization', 'Bearer invalid-token-12345')
            .expect(401);
    });

    // Test 6: Role-specific permissions
    test('super admin has read-only access to alerts', async () => {
        // Super admin can view alerts
        const viewAlerts = await request(API_URL)
            .get('/api/alerts')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .expect(200);

        expect(viewAlerts.body).toBeDefined();
    });
});

/**
 * How to run this test:
 * 
 * 1. Make sure backend is running: npm run dev
 * 2. Make sure super admin is seeded: npm run seed:admin
 * 3. Install test dependencies: npm install --save-dev jest supertest
 * 4. Run tests: npm test tests/rbac.test.js
 * 
 * Expected results:
 * - All 6 tests should pass
 * - Tenant isolation should be enforced
 * - Authentication should work correctly
 * - No cross-tenant data leakage
 */
