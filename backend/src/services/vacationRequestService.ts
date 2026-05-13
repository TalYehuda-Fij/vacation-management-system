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
    .orderBy('vr.created_at', dto.sort === 'asc' ? 'ASC' : 'DESC')
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
