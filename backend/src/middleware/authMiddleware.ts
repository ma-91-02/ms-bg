import { Request } from 'express';
import { Document } from 'mongoose';

/**
 * امتداد للواجهة Request لإضافة المستخدم
 */
export interface AuthRequest extends Request {
  user?: Document & {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role: string;
    points: number;
  };
} 