import mongoose, { Schema, Document } from 'mongoose';

// تعريف نوع الإعلان (مفقود أو موجود)
export enum AdvertisementType {
  LOST = 'lost',
  FOUND = 'found'
}

// تعريف فئة العنصر
export enum ItemCategory {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVING_LICENSE = 'driving_license',
  OTHER = 'other'
}

// قائمة المحافظات
export enum Governorate {
  BAGHDAD = 'baghdad',
  BASRA = 'basra',
  ERBIL = 'erbil',
  SULAYMANIYAH = 'sulaymaniyah',
  DUHOK = 'duhok',
  NINEVEH = 'nineveh',
  KIRKUK = 'kirkuk',
  DIYALA = 'diyala',
  ANBAR = 'anbar',
  BABIL = 'babil',
  KARBALA = 'karbala',
  NAJAF = 'najaf',
  WASIT = 'wasit',
  MUTHANNA = 'muthanna',
  DIWANIYAH = 'diwaniyah',
  MAYSAN = 'maysan',
  DHIQAR = 'dhiqar',
  SALADIN = 'saladin'
}

// حالة الإعلان
export enum AdvertisementStatus {
  PENDING = 'pending',    // في انتظار الموافقة
  APPROVED = 'approved',  // تمت الموافقة
  REJECTED = 'rejected',  // مرفوض
  RESOLVED = 'resolved'   // تم حله (وجد صاحبه)
}

// واجهة الإعلان
export interface IAdvertisement extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  type: AdvertisementType;
  category: ItemCategory;
  governorate: Governorate;
  ownerName?: string;
  itemNumber?: string;
  description: string;
  images: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
  contactPhone: string;
  status: AdvertisementStatus;
  isApproved: boolean;     // هل تمت الموافقة على الإعلان
  approvedAt?: Date;       // تاريخ الموافقة
  approvedBy?: mongoose.Schema.Types.ObjectId; // مشرف الموافقة
  rejectionReason?: string; // سبب الرفض (إن وجد)
  isResolved: boolean;
  resolvedAt?: Date;
  hideContactInfo: boolean;    // إخفاء معلومات التواصل
  createdAt: Date;
  updatedAt: Date;
}

// مخطط الإعلان
const advertisementSchema = new Schema<IAdvertisement>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'المستخدم مطلوب']
    },
    type: {
      type: String,
      enum: Object.values(AdvertisementType),
      required: [true, 'نوع الإعلان مطلوب (مفقود/موجود)']
    },
    category: {
      type: String,
      enum: Object.values(ItemCategory),
      required: [true, 'فئة العنصر مطلوبة']
    },
    governorate: {
      type: String,
      enum: Object.values(Governorate),
      required: [true, 'المحافظة مطلوبة']
    },
    ownerName: {
      type: String,
      // اختياري حسب الحالة
    },
    itemNumber: {
      type: String,
      // اختياري حسب الحالة
    },
    description: {
      type: String,
      required: [true, 'وصف العنصر مطلوب']
    },
    images: {
      type: [String],
      default: []
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    contactPhone: {
      type: String,
      required: [true, 'رقم الاتصال مطلوب']
    },
    status: {
      type: String,
      enum: Object.values(AdvertisementStatus),
      default: AdvertisementStatus.PENDING
    },
    isApproved: {
      type: Boolean,
      default: false  // تعيين افتراضي: الإعلان يحتاج موافقة
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    rejectionReason: String,
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    hideContactInfo: {
      type: Boolean,
      default: true  // إخفاء معلومات التواصل افتراضيًا
    }
  },
  {
    timestamps: true
  }
);

// إضافة مؤشر جغرافي للبحث حسب الموقع
advertisementSchema.index({ location: '2dsphere' });

const Advertisement = mongoose.model<IAdvertisement>('Advertisement', advertisementSchema);

export default Advertisement; 