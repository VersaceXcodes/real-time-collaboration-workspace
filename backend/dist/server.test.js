import request from 'supertest';
import { app, pool } from './server'; // import your Express app instance and database pool
describe('Server', () => {
    afterAll(async () => {
        // Close database connections
        await pool.end();
    });
    test('should respond with server status', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Server running with authentication and WebSockets');
    });
});
//# sourceMappingURL=server.test.js.map