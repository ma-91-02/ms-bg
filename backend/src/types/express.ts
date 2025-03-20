import { Request } from 'express';
import { Document } from 'mongoose';

// تعريف نوع المستخدم
interface UserDocument extends Document {
  _id: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
  // أي خصائص أخرى للمستخدم
}

// تعريف طلب المصادقة بإضافة المستخدم
export interface AuthRequest extends Request {
  user?: UserDocument;
} 