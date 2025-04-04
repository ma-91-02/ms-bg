import mongoose, { Schema, Document } from 'mongoose';

export enum MatchStatus {
  PENDING = 'pending',    // بانتظار موافقة المشرف
  APPROVED = 'approved',  // تم التأكيد من المشرف
  REJECTED = 'rejected',  // تم الرفض من المشرف
  COMPLETED = 'completed' // تم استكمال عملية الاسترجاع
}

export interface IAdvertisementMatch extends Document {
  lostAdvertisementId: mongoose.Schema.Types.ObjectId; // إعلان المفقود
  foundAdvertisementId: mongoose.Schema.Types.ObjectId; // إعلان الموجود
  matchScore: number;                     // درجة التطابق (0-100)
  matchingFields: string[];               // الحقول المتطابقة (رقم المستند، الاسم، الوصف...)
  status: MatchStatus;                    // حالة المطابقة
  approvedBy?: mongoose.Schema.Types.ObjectId; // المشرف الذي وافق
  approvedAt?: Date;                     // تاريخ الموافقة
  notificationSent: boolean;             // هل تم إرسال إشعار
  notificationSentAt?: Date;             // وقت إرسال الإشعار
  notes?: string;                        // ملاحظات المشرف
  createdAt: Date;
  updatedAt: Date;
}

const advertisementMatchSchema = new Schema<IAdvertisementMatch>(
  {
    lostAdvertisementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advertisement',
      required: [true, 'إعلان المفقود مطلوب']
    },
    foundAdvertisementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advertisement',
      required: [true, 'إعلان الموجود مطلوب']
    },
    matchScore: {
      type: Number,
      required: [true, 'درجة التطابق مطلوبة'],
      min: 0,
      max: 100
    },
    matchingFields: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.PENDING
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: Date,
    notificationSent: {
      type: Boolean,
      default: false
    },
    notificationSentAt: Date,
    notes: String
  },
  {
    timestamps: true
  }
);

// إضافة مؤشر على الإعلانات
advertisementMatchSchema.index({ lostAdvertisementId: 1, foundAdvertisementId: 1 }, { unique: true });

const AdvertisementMatch = mongoose.model<IAdvertisementMatch>('AdvertisementMatch', advertisementMatchSchema);

export default AdvertisementMatch; 