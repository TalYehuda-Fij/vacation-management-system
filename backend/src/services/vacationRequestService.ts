import { AppDataSource } from '../config/data-source.js';
import { VacationRequest, RequestStatus } from '../entities/VacationRequest.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateRequestDto, ListQueryDto } from '../dto/vacationRequest.dto.js';

export async function createRequest(userId: string, dto: CreateRequestDto) {
  const repo = AppDataSource.getRepository(VacationRequest);

  const overlap = await repo
    .createQueryBuilder('vr')
    .where('vr.user_id = :userId', { userId })
    .andWhere('vr.status IN (:...statuses)', {
      statuses: [RequestStatus.PENDING, RequestStatus.APPROVED],
    })
    .andWhere('vr.start_date <= :end', { end: dto.end_date })
    .andWhere('vr.end_date >= :start', { start: dto.start_date })
    .getOne();

  if (overlap) {
    throw new AppError(409, 'DATE_OVERLAP', 'Dates overlap with an existing pending or approved request');
  }

  const request = repo.create({
    userId,
    startDate: dto.start_date,
    endDate: dto.end_date,
    reason: dto.reason ?? null,
    status: RequestStatus.PENDING,
  });

  return repo.save(request);
}

export async function getMyRequests(userId: string) {
  const repo = AppDataSource.getRepository(VacationRequest);
  return repo.find({
    where: { userId },
    order: { createdAt: 'DESC' },
  });
}

export async function getAllRequests(dto: ListQueryDto) {
  const repo = AppDataSource.getRepository(VacationRequest);

  const qb = repo
    .createQueryBuilder('vr')
    .leftJoinAndSelect('vr.user', 'u')
    .orderBy('vr.createdAt', dto.sort === 'asc' ? 'ASC' : 'DESC')
    .skip((dto.page - 1) * dto.pageSize)
    .take(dto.pageSize);

  if (dto.status) {
    qb.where('vr.status = :status', { status: dto.status });
  }

  const [items, total] = await qb.getManyAndCount();

  return {
    items,
    total,
    page: dto.page,
    pageSize: dto.pageSize,
    totalPages: Math.ceil(total / dto.pageSize),
  };
}

export async function approveRequest(id: string, reviewerId: string, comments?: string) {
  const repo = AppDataSource.getRepository(VacationRequest);
  const request = await repo.findOneBy({ id });

  if (!request) throw new AppError(404, 'NOT_FOUND', 'Request not found');
  if (request.status !== RequestStatus.PENDING) {
    throw new AppError(422, 'INVALID_TRANSITION', `Cannot approve a ${request.status} request`);
  }

  request.status = RequestStatus.APPROVED;
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();
  request.comments = comments ?? null;

  return repo.save(request);
}

const QUOTA = 20;
const MAX_OVERDRAFT = 4;

export async function getEmployeeMetrics() {
  const year = new Date().getFullYear();

  const rows = await AppDataSource.query<
    { id: string; name: string; email: string; days_taken: string }[]
  >(
    `SELECT u.id, u.name, u.email,
            COALESCE(SUM(vr.end_date - vr.start_date + 1), 0) AS days_taken
     FROM users u
     LEFT JOIN vacation_requests vr
            ON vr.user_id = u.id
           AND vr.status = 'approved'
           AND EXTRACT(YEAR FROM vr.start_date) = $1
     WHERE u.role = 'requester'
     GROUP BY u.id, u.name, u.email
     ORDER BY u.name`,
    [year],
  );

  return rows.map((r) => {
    const daysTaken = Number(r.days_taken);
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      daysTaken,
      daysRemaining: QUOTA - daysTaken,
      quota: QUOTA,
      maxAllowed: QUOTA + MAX_OVERDRAFT,
      year,
    };
  });
}

export async function getMyMetrics(userId: string) {
  const year = new Date().getFullYear();

  const rows = await AppDataSource.query<{ days_taken: string }[]>(
    `SELECT COALESCE(SUM(end_date - start_date + 1), 0) AS days_taken
     FROM vacation_requests
     WHERE user_id = $1
       AND status = 'approved'
       AND EXTRACT(YEAR FROM start_date) = $2`,
    [userId, year],
  );

  const daysTaken = Number(rows[0]?.days_taken ?? 0);
  return {
    daysTaken,
    daysRemaining: QUOTA - daysTaken,
    quota: QUOTA,
    maxAllowed: QUOTA + MAX_OVERDRAFT,
    year,
  };
}

export async function getStats() {
  const repo = AppDataSource.getRepository(VacationRequest);
  const rows = await repo
    .createQueryBuilder('vr')
    .select('vr.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('vr.status')
    .getRawMany<{ status: string; count: string }>();

  const map: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) map[row.status] = Number(row.count);
  const total = map.pending + map.approved + map.rejected;
  return { total, ...map };
}

export async function getActivity(limit = 10) {
  const repo = AppDataSource.getRepository(VacationRequest);
  return repo
    .createQueryBuilder('vr')
    .leftJoinAndSelect('vr.user', 'u')
    .leftJoinAndSelect('vr.reviewer', 'r')
    .where('vr.status IN (:...statuses)', { statuses: [RequestStatus.APPROVED, RequestStatus.REJECTED] })
    .orderBy('vr.reviewedAt', 'DESC')
    .take(limit)
    .getMany();
}

export async function rejectRequest(id: string, reviewerId: string, comments: string) {
  const repo = AppDataSource.getRepository(VacationRequest);
  const request = await repo.findOneBy({ id });

  if (!request) throw new AppError(404, 'NOT_FOUND', 'Request not found');
  if (request.status !== RequestStatus.PENDING) {
    throw new AppError(422, 'INVALID_TRANSITION', `Cannot reject a ${request.status} request`);
  }

  request.status = RequestStatus.REJECTED;
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();
  request.comments = comments;

  return repo.save(request);
}
