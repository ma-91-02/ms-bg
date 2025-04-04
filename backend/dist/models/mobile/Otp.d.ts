import mongoose, { Document } from 'mongoose';
export interface IOtp extends Document {
    phoneNumber: string;
    code: string;
    createdAt: Date;
    expiresAt: Date;
    isUsed: boolean;
    isForPasswordReset: boolean;
}
declare const Otp: mongoose.Model<IOtp, {}, {}, {}, mongoose.Document<unknown, {}, IOtp> & IOtp & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Otp;
//# sourceMappingURL=Otp.d.ts.map