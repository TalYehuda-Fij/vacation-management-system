import { Request, Response, NextFunction } from 'express';
import {
  createRequestSchema,
  listQuerySchema,
  approveSchema,
  rejectSchema,
} from '../dto/vacationRequest.dto.js';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from '../services/vacationRequestService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = createRequestSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten()));
    }
    const request = await createRequest(req.user!.sub, result.data);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function getMyRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await getMyRequests(req.user!.sub);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

export async function getAllRequestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = listQuerySchema.safeParse(req.query);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query', result.error.flatten()));
    }
    const data = await getAllRequests(result.data);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function approveRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = approveSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten()));
    }
    const request = await approveRequest(req.params.id, req.user!.sub, result.data.comments);
    res.json(request);
  } catch (err) {
    next(err);
  }
}

export async function rejectRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = rejectSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten()));
    }
    const request = await rejectRequest(req.params.id, req.user!.sub, result.data.comments);
    res.json(request);
  } catch (err) {
    next(err);
  }
}
