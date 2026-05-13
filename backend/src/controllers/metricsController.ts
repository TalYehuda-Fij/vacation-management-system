import { Request, Response, NextFunction } from 'express';
import { getEmployeeMetrics, getMyMetrics } from '../services/vacationRequestService.js';

export async function employeeMetricsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getEmployeeMetrics());
  } catch (err) {
    next(err);
  }
}

export async function myMetricsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getMyMetrics(req.user!.sub));
  } catch (err) {
    next(err);
  }
}
