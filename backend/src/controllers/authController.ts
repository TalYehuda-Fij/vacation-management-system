import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../dto/auth.dto.js';
import { login } from '../services/authService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid input', result.error.flatten()));
    }
    const data = await login(result.data.email, result.data.password);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export function meHandler(req: Request, res: Response) {
  res.json({ user: req.user });
}
