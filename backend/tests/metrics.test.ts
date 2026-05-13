import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { AppDataSource } from '../src/config/data-source.js';
import { app } from '../src/app.js';
import { User, UserRole } from '../src/entities/User.js';
import { VacationRequest, RequestStatus } from '../src/entities/VacationRequest.js';
import bcrypt from 'bcrypt';

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
}

let requesterToken: string;
let validatorToken: string;
let requesterId: string;
let validatorId: string;

const currentYear = new Date().getFullYear();

beforeEach(async () => {
  await AppDataSource.query(`TRUNCATE vacation_requests, users CASCADE`);

  const userRepo = AppDataSource.getRepository(User);
  const hash = await bcrypt.hash('password123', 10);

  const requester = userRepo.create({
    name: 'Alice',
    email: 'alice@test.com',
    passwordHash: hash,
    role: UserRole.REQUESTER,
  });
  const validator = userRepo.create({
    name: 'Bob',
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

describe('GET /api/metrics', () => {
  it('returns 403 for requester', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(403);
  });

  it('returns employee list with zero days when no requests', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const alice = res.body.find((e: { name: string }) => e.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice.daysTaken).toBe(0);
    expect(alice.daysRemaining).toBe(20);
    expect(alice.quota).toBe(20);
    expect(alice.maxAllowed).toBe(24);
  });

  it('counts only approved requests toward days taken', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    await repo.save([
      repo.create({ userId: requesterId, startDate: `${currentYear}-06-01`, endDate: `${currentYear}-06-05`, status: RequestStatus.APPROVED }),
      repo.create({ userId: requesterId, startDate: `${currentYear}-07-01`, endDate: `${currentYear}-07-03`, status: RequestStatus.PENDING }),
      repo.create({ userId: requesterId, startDate: `${currentYear}-08-01`, endDate: `${currentYear}-08-02`, status: RequestStatus.REJECTED }),
    ]);

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    const alice = res.body.find((e: { name: string }) => e.name === 'Alice');
    // June 1–5 inclusive = 5 days; pending and rejected should not count
    expect(alice.daysTaken).toBe(5);
  });

  it('calculates days inclusively (start and end both count)', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    // single day request
    await repo.save(
      repo.create({ userId: requesterId, startDate: `${currentYear}-06-01`, endDate: `${currentYear}-06-01`, status: RequestStatus.APPROVED }),
    );

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${validatorToken}`);
    const alice = res.body.find((e: { name: string }) => e.name === 'Alice');
    expect(alice.daysTaken).toBe(1);
  });

  it('ignores requests from previous years', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    const lastYear = currentYear - 1;
    await repo.save([
      repo.create({ userId: requesterId, startDate: `${lastYear}-06-01`, endDate: `${lastYear}-06-10`, status: RequestStatus.APPROVED }),
      repo.create({ userId: requesterId, startDate: `${currentYear}-03-01`, endDate: `${currentYear}-03-03`, status: RequestStatus.APPROVED }),
    ]);

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${validatorToken}`);
    const alice = res.body.find((e: { name: string }) => e.name === 'Alice');
    // only current year request counts: Mar 1–3 = 3 days
    expect(alice.daysTaken).toBe(3);
  });

  it('accumulates multiple approved requests', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    await repo.save([
      repo.create({ userId: requesterId, startDate: `${currentYear}-06-01`, endDate: `${currentYear}-06-05`, status: RequestStatus.APPROVED }), // 5
      repo.create({ userId: requesterId, startDate: `${currentYear}-08-10`, endDate: `${currentYear}-08-11`, status: RequestStatus.APPROVED }), // 2
    ]);

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${validatorToken}`);
    const alice = res.body.find((e: { name: string }) => e.name === 'Alice');
    expect(alice.daysTaken).toBe(7);
    expect(alice.daysRemaining).toBe(13);
  });
});

describe('GET /api/metrics/me', () => {
  it('returns 403 for validator', async () => {
    const res = await request(app)
      .get('/api/metrics/me')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(403);
  });

  it('returns zero days when no approved requests', async () => {
    const res = await request(app)
      .get('/api/metrics/me')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.daysTaken).toBe(0);
    expect(res.body.daysRemaining).toBe(20);
    expect(res.body.quota).toBe(20);
    expect(res.body.maxAllowed).toBe(24);
  });

  it('returns correct days for requester own approved requests', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    await repo.save(
      repo.create({ userId: requesterId, startDate: `${currentYear}-05-01`, endDate: `${currentYear}-05-05`, status: RequestStatus.APPROVED }),
    );

    const res = await request(app)
      .get('/api/metrics/me')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.daysTaken).toBe(5);
    expect(res.body.daysRemaining).toBe(15);
  });

  it('reflects overdraft correctly when over quota', async () => {
    const repo = AppDataSource.getRepository(VacationRequest);
    // 22 days total — 2 into overdraft
    await repo.save([
      repo.create({ userId: requesterId, startDate: `${currentYear}-01-01`, endDate: `${currentYear}-01-10`, status: RequestStatus.APPROVED }), // 10
      repo.create({ userId: requesterId, startDate: `${currentYear}-02-01`, endDate: `${currentYear}-02-12`, status: RequestStatus.APPROVED }), // 12
    ]);

    const res = await request(app)
      .get('/api/metrics/me')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.body.daysTaken).toBe(22);
    expect(res.body.daysRemaining).toBe(-2);
  });
});
