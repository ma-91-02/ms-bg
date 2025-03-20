import mongoose, { Schema, Document } from 'mongoose';

export enum ContactRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IContactRequest extends Document {
  userId: mongoose.Schema.Types.ObjectId;      // المستخدم الذي طلب التواصل
  advertisementId: mongoose.Schema.Types.ObjectId; // الإعلان المطلوب التواصل بصاحبه
  advertiserUserId: mongoose.Schema.Types.ObjectId; // صاحب الإعلان
  reason: string;                              // سبب طلب التواصل
  status: ContactRequestStatus;                // حالة الطلب
  approvedBy?: mongoose.Schema.Types.ObjectId; // المشرف الذي وافق على الطلب
  approvedAt?: Date;                           // تاريخ الموافقة
  rejectionReason?: string;                    // سبب الرفض
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب']
    },
    advertisementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advertisement',
      required: [true, 'معرف الإعلان مطلوب']
    },
    advertiserUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف صاحب الإعلان مطلوب']
    },
    reason: {
      type: String,
      required: [true, 'سبب طلب التواصل مطلوب']
    },
    status: {
      type: String,
      enum: Object.values(ContactRequestStatus),
      default: ContactRequestStatus.PENDING
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: {
      type: Date
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const ContactRequest = mongoose.model<IContactRequest>('ContactRequest', contactRequestSchema);

export default ContactRequest; 