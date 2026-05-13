import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import 'reflect-metadata';
import { AppDataSource } from '../src/config/data-source.js';
import { app } from '../src/app.js';
import { User, UserRole } from '../src/entities/User.js';
import bcrypt from 'bcrypt';

let aliceToken: string;
let alice: User;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.query(`TRUNCATE vacation_requests, users CASCADE`);

  const repo = AppDataSource.getRepository(User);
  alice = repo.create({
    name: 'Alice',
    email: 'alice@test.com',
    passwordHash: await bcrypt.hash('password123', 10),
    role: UserRole.REQUESTER,
  });
  await repo.save(alice);
});

describe('POST /api/auth/login', () => {
  it('returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@test.com');
    aliceToken = res.body.token;
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns current user with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@test.com');
  });
});
