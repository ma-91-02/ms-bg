import { Document } from 'mongoose';
import { IUser } from '../models/mobile/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      userDocument?: Document & IUser;
    }
  }
}

// يجب استخدام export {} لجعله وحدة ES
export {}; 