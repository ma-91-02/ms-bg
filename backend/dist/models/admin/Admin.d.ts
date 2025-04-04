import mongoose, { Document } from 'mongoose';
export interface IAdmin extends Document {
    username: string;
    password: string;
    email: string;
    fullName: string;
    role: string;
    lastLogin?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (candidatePassword: string) => Promise<boolean>;
}
declare const Admin: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin> & IAdmin & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Admin;
//# sourceMappingURL=Admin.d.ts.map