import request from 'supertest';
import { app, pool } from './server'; // import your Express app instance and database pool

describe('Server', () => {
  afterAll(async () => {
    // Close database connections
    await pool.end();
  });

  test('should respond with health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('healthy');
  });

  test('should respond with ping', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('pong');
  });
});
