import request from 'supertest';
import { app, pool } from './server.ts';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

jest.mock('jsonwebtoken');
jest.mock('./db'); // Assume db functions are properly mocked

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password_hash: 'password123',
          role: 'member'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toEqual('test@example.com');
      expect(response.body.auth_token).toBeDefined();
    });

    it('should return 400 for existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'john.doe@example.com',
          name: 'John Doe',
          password_hash: 'password123',
          role: 'admin'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already in use');
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toEqual('john.doe@example.com');
      expect(response.body.auth_token).toBeDefined();
    });

    it('should return 401 for incorrect credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});

describe('User API', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ user_id: 'user1', role: 'admin' }, 'secret');
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].email).toBeDefined();
    });
  });

  describe('GET /users/:user_id', () => {
    it('should return a user by ID', async () => {
      const response = await request(app)
        .get('/users/user1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user_id).toBe('user1');
      expect(response.body.email).toBe('john.doe@example.com');
    });
  });
});

describe('WebSocket interactions', () => {
  let ws;

  beforeEach((done) => {
    ws = new WebSocket('ws://localhost:3000');
    ws.on('open', done);
  });

  afterEach(() => {
    ws.close();
  });

  it('should broadcast user status update', (done) => {
    const userStatusMessage = {
      user_id: 'user1',
      status: 'online',
    };

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.user_id).toBe('user1');
      expect(message.status).toBe('online');
      done();
    });

    ws.send(JSON.stringify(userStatusMessage));
  });
});