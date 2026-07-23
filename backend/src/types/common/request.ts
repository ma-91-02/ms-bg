import { Request } from 'express';
import type { User, Admin } from '@prisma/client';

export type AuthenticatedUser = Omit<User, 'password'>;
export type AuthenticatedAdmin = Omit<Admin, 'password'>;

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  admin?: AuthenticatedAdmin;
}
