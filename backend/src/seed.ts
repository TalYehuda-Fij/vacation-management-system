import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AppDataSource } from './config/data-source.js';
import { User, UserRole } from './entities/User.js';
import { VacationRequest, RequestStatus } from './entities/VacationRequest.js';

await AppDataSource.initialize();

const userRepo = AppDataSource.getRepository(User);
const requestRepo = AppDataSource.getRepository(VacationRequest);

async function upsertUser(data: Partial<User> & { email: string }): Promise<User> {
  const existing = await userRepo.findOneBy({ email: data.email });
  if (existing) return existing;
  const user = userRepo.create(data);
  return userRepo.save(user);
}

const passwordHash = await bcrypt.hash('password123', 10);

// Managers
const bob = await upsertUser({
  name: 'Bob Validator',
  email: 'bob@example.com',
  passwordHash,
  role: UserRole.VALIDATOR,
});

const carol = await upsertUser({
  name: 'Carol Validator',
  email: 'carol@example.com',
  passwordHash,
  role: UserRole.VALIDATOR,
});

// Employees — 3 per manager (conceptually grouped)
const alice = await upsertUser({
  name: 'Alice Requester',
  email: 'alice@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const david = await upsertUser({
  name: 'David Requester',
  email: 'david@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const eve = await upsertUser({
  name: 'Eve Requester',
  email: 'eve@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const frank = await upsertUser({
  name: 'Frank Requester',
  email: 'frank@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const grace = await upsertUser({
  name: 'Grace Requester',
  email: 'grace@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const henry = await upsertUser({
  name: 'Henry Requester',
  email: 'henry@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

async function seedRequests(user: User, reviewer: User, requests: Partial<VacationRequest>[]) {
  const existing = await requestRepo.findBy({ userId: user.id });
  if (existing.length > 0) return;
  await requestRepo.save(requests.map((r) => requestRepo.create({ ...r, userId: user.id })));
}

// Alice — reviewed by Bob
await seedRequests(alice, bob, [
  { startDate: '2026-06-01', endDate: '2026-06-05', reason: 'Summer holiday', status: RequestStatus.PENDING },
  { startDate: '2026-03-10', endDate: '2026-03-14', reason: 'Family trip', status: RequestStatus.APPROVED, reviewedBy: bob.id, reviewedAt: new Date(), comments: 'Enjoy!' },
  { startDate: '2026-01-20', endDate: '2026-01-22', reason: 'Personal days', status: RequestStatus.REJECTED, reviewedBy: bob.id, reviewedAt: new Date(), comments: 'Too many people off that week.' },
]);

// David — reviewed by Bob
await seedRequests(david, bob, [
  { startDate: '2026-07-14', endDate: '2026-07-18', reason: 'Wedding anniversary', status: RequestStatus.PENDING },
  { startDate: '2026-04-01', endDate: '2026-04-04', reason: 'Easter break', status: RequestStatus.APPROVED, reviewedBy: bob.id, reviewedAt: new Date(), comments: 'Approved.' },
  { startDate: '2026-02-10', endDate: '2026-02-12', reason: 'Ski trip', status: RequestStatus.REJECTED, reviewedBy: bob.id, reviewedAt: new Date(), comments: 'Project deadline that week.' },
]);

// Eve — reviewed by Bob
await seedRequests(eve, bob, [
  { startDate: '2026-09-01', endDate: '2026-09-05', reason: 'End-of-summer trip', status: RequestStatus.PENDING },
  { startDate: '2026-05-20', endDate: '2026-05-23', reason: 'Long weekend', status: RequestStatus.APPROVED, reviewedBy: bob.id, reviewedAt: new Date(), comments: 'No issues.' },
  { startDate: '2026-03-03', endDate: '2026-03-07', reason: 'Conference recovery', status: RequestStatus.PENDING },
]);

// Frank — reviewed by Carol
await seedRequests(frank, carol, [
  { startDate: '2026-06-15', endDate: '2026-06-20', reason: 'Honeymoon', status: RequestStatus.APPROVED, reviewedBy: carol.id, reviewedAt: new Date(), comments: 'Congratulations!' },
  { startDate: '2026-08-01', endDate: '2026-08-05', reason: 'Summer break', status: RequestStatus.PENDING },
  { startDate: '2026-04-10', endDate: '2026-04-11', reason: 'Medical appointment', status: RequestStatus.APPROVED, reviewedBy: carol.id, reviewedAt: new Date(), comments: 'Approved.' },
]);

// Grace — reviewed by Carol
await seedRequests(grace, carol, [
  { startDate: '2026-07-04', endDate: '2026-07-08', reason: 'Family reunion', status: RequestStatus.PENDING },
  { startDate: '2026-02-20', endDate: '2026-02-25', reason: 'Carnival trip', status: RequestStatus.REJECTED, reviewedBy: carol.id, reviewedAt: new Date(), comments: 'Short-staffed that week.' },
  { startDate: '2026-10-12', endDate: '2026-10-16', reason: 'Fall holiday', status: RequestStatus.PENDING },
]);

// Henry — reviewed by Carol
await seedRequests(henry, carol, [
  { startDate: '2026-05-01', endDate: '2026-05-05', reason: 'Spring break', status: RequestStatus.APPROVED, reviewedBy: carol.id, reviewedAt: new Date(), comments: 'Enjoy the break.' },
  { startDate: '2026-08-20', endDate: '2026-08-22', reason: 'Moving day', status: RequestStatus.PENDING },
  { startDate: '2026-11-25', endDate: '2026-11-28', reason: 'Thanksgiving', status: RequestStatus.PENDING },
]);

await AppDataSource.destroy();
