import mongoose, { Document } from 'mongoose';
export declare enum MatchStatus {
    PENDING = "pending",// بانتظار موافقة المشرف
    APPROVED = "approved",// تم التأكيد من المشرف
    REJECTED = "rejected",// تم الرفض من المشرف
    COMPLETED = "completed"
}
export interface IAdvertisementMatch extends Document {
    lostAdvertisementId: mongoose.Schema.Types.ObjectId;
    foundAdvertisementId: mongoose.Schema.Types.ObjectId;
    matchScore: number;
    matchingFields: string[];
    status: MatchStatus;
    approvedBy?: mongoose.Schema.Types.ObjectId;
    approvedAt?: Date;
    notificationSent: boolean;
    notificationSentAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const AdvertisementMatch: mongoose.Model<IAdvertisementMatch, {}, {}, {}, mongoose.Document<unknown, {}, IAdvertisementMatch> & IAdvertisementMatch & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default AdvertisementMatch;
//# sourceMappingURL=AdvertisementMatch.d.ts.map