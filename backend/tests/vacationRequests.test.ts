import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import 'reflect-metadata';
import { AppDataSource } from '../src/config/data-source.js';
import { app } from '../src/server.js';
import { User, UserRole } from '../src/entities/User.js';
import { VacationRequest, RequestStatus } from '../src/entities/VacationRequest.js';
import bcrypt from 'bcrypt';

let requesterToken: string;
let validatorToken: string;
let requesterId: string;
let validatorId: string;

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  await AppDataSource.runMigrations();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.query(`TRUNCATE vacation_requests, users CASCADE`);

  const userRepo = AppDataSource.getRepository(User);
  const hash = await bcrypt.hash('password123', 10);

  const requester = userRepo.create({
    name: 'Tester Alice',
    email: 'alice@test.com',
    passwordHash: hash,
    role: UserRole.REQUESTER,
  });
  const validator = userRepo.create({
    name: 'Tester Bob',
    email: 'bob@test.com',
    passwordHash: hash,
    role: UserRole.VALIDATOR,
  });
  await userRepo.save([requester, validator]);
  requesterId = requester.id;
  validatorId = validator.id;

  requesterToken = await loginAs('alice@test.com', 'password123');
  validatorToken = await loginAs('bob@test.com', 'password123');
});

describe('POST /api/vacation-requests', () => {
  it('creates a request successfully', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-05', reason: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.startDate).toBe('2026-07-01');
  });

  it('rejects when end < start', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-10', end_date: '2026-07-01' });
    expect(res.status).toBe(400);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on date overlap with pending request', async () => {
    await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-10' });

    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-05', end_date: '2026-07-15' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DATE_OVERLAP');
  });
});

describe('GET /api/vacation-requests/mine', () => {
  it('returns only the caller\'s requests', async () => {
    await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-03' });

    const res = await request(app)
      .get('/api/vacation-requests/mine')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].userId).toBe(requesterId);
  });
});

describe('GET /api/vacation-requests', () => {
  it('returns 403 for requester', async () => {
    const res = await request(app)
      .get('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(403);
  });

  it('returns paginated list for validator', async () => {
    await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-03' });

    const res = await request(app)
      .get('/api/vacation-requests')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body.items.length).toBe(1);
  });

  it('filters by status', async () => {
    await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-03' });

    const res = await request(app)
      .get('/api/vacation-requests?status=approved')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
  });
});

describe('PATCH /api/vacation-requests/:id/approve', () => {
  let requestId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-05' });
    requestId = res.body.id;
  });

  it('approves a pending request', async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.reviewedBy).toBe(validatorId);
  });

  it('returns 422 when approving an already-approved request', async () => {
    await request(app)
      .patch(`/api/vacation-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({});

    const res = await request(app)
      .patch(`/api/vacation-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({});
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/vacation-requests/:id/reject', () => {
  let requestId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/vacation-requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ start_date: '2026-07-01', end_date: '2026-07-05' });
    requestId = res.body.id;
  });

  it('rejects when comment is missing', async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('rejects a pending request with comment', async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ comments: 'Too many people off.' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.comments).toBe('Too many people off.');
  });
});
