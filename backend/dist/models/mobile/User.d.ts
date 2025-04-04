import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    phoneNumber: string;
    fullName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    birthDate?: Date;
    address?: string;
    profileImage?: string;
    isBlocked: boolean;
    points: number;
    isAdmin?: boolean;
    otp?: string;
    otpExpires?: Date;
    isProfileComplete: boolean;
    favorites: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map