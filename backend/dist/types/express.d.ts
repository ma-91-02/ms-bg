import { Request } from 'express';
import { Document } from 'mongoose';
interface UserDocument extends Document {
    _id: string;
    phoneNumber: string;
    fullName?: string;
    email?: string;
}
export interface AuthRequest extends Request {
    user?: UserDocument;
}
export {};
//# sourceMappingURL=express.d.ts.map