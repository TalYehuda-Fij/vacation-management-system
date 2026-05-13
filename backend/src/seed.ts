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

const alice = await upsertUser({
  name: 'Alice Requester',
  email: 'alice@example.com',
  passwordHash,
  role: UserRole.REQUESTER,
});

const bob = await upsertUser({
  name: 'Bob Validator',
  email: 'bob@example.com',
  passwordHash,
  role: UserRole.VALIDATOR,
});

const existingRequests = await requestRepo.findBy({ userId: alice.id });
if (existingRequests.length === 0) {
  await requestRepo.save([
    requestRepo.create({
      userId: alice.id,
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      reason: 'Summer holiday',
      status: RequestStatus.PENDING,
    }),
    requestRepo.create({
      userId: alice.id,
      startDate: '2026-03-10',
      endDate: '2026-03-14',
      reason: 'Family trip',
      status: RequestStatus.APPROVED,
      reviewedBy: bob.id,
      reviewedAt: new Date(),
      comments: 'Enjoy!',
    }),
    requestRepo.create({
      userId: alice.id,
      startDate: '2026-01-20',
      endDate: '2026-01-22',
      reason: 'Personal days',
      status: RequestStatus.REJECTED,
      reviewedBy: bob.id,
      reviewedAt: new Date(),
      comments: 'Too many people off that week.',
    }),
    requestRepo.create({
      userId: alice.id,
      startDate: '2026-08-15',
      endDate: '2026-08-20',
      reason: 'Beach vacation',
      status: RequestStatus.PENDING,
    }),
  ]);
}

await AppDataSource.destroy();
