import mongoose, { Document } from 'mongoose';
export declare enum ContactRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export interface IContactRequest extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    advertisementId: mongoose.Schema.Types.ObjectId;
    advertiserUserId: mongoose.Schema.Types.ObjectId;
    reason: string;
    status: ContactRequestStatus;
    approvedBy?: mongoose.Schema.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const ContactRequest: mongoose.Model<IContactRequest, {}, {}, {}, mongoose.Document<unknown, {}, IContactRequest> & IContactRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default ContactRequest;
//# sourceMappingURL=ContactRequest.d.ts.map