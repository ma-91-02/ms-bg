import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role?: string;
  };
} 