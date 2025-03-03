import { IUser } from '../models/mobile/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
      userDocument?: IUser; // نستخدم الواجهة المعرفة مسبقاً
    }
  }
}

// يجب استخدام export {} لجعله وحدة ES
export {}; 