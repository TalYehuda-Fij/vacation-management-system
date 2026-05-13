import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { AppError } from '../middleware/errorHandler.js';

export async function login(email: string, password: string) {
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ email });
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const payload = { sub: user.id, role: user.role, name: user.name, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET ?? 'change_me', { expiresIn: '8h' });

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
