const request = require('supertest');

const baseURL = 'http://localhost:5004';

describe('Authentication Test', () => {
    test('Login should return a token', async () => {
        const response = await request(baseURL)
            .post('/api/auth/login')
            .send({
                email: 'superadmin@gmail.com',
                password: 'super12345'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(typeof response.body.token).toBe('string');
    });
});
