const request = require('supertest');

const baseURL = 'http://localhost:5004';

describe('Log Ingestion Test', () => {
    test('POST /ingest/http should return success', async () => {
        const response = await request(baseURL)
            .post('/api/ingest/http')
            .send({
                tenant: 'Lumiq-thailand.com',
                source: 'api',
                event_type: 'login_success',
                user: 'testuser',
                ip: '192.168.1.100'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.id).toBeDefined();
    });
});
