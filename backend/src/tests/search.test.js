const request = require('supertest');

const baseURL = 'http://localhost:5004';

describe('Log Search Test', () => {
    let authToken;

    beforeAll(async () => {
        const loginResponse = await request(baseURL)
            .post('/api/auth/login')
            .send({
                email: 'superadmin@gmail.com',
                password: 'super12345'
            });
        authToken = loginResponse.body.token;
    });

    test('GET /logs/search should return an array', async () => {
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const to = new Date().toISOString();

        const response = await request(baseURL)
            .get('/api/logs/search')
            .query({
                tenant: 'all',
                from: from,
                to: to
            })
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
