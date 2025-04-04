import { Document } from 'mongoose';
import { Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        id: string;
        fullName: string;
        phoneNumber: string;
        email?: string;
        role?: string;
      }
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role?: string;
  };
  body: any;
  params: any;
  query: any;
  headers: any;
}

// للتوافق مع TypeScript module system
export {}; 