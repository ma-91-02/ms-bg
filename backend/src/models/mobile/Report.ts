import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  date: Date;
  images: string[]; // روابط الصور
  documentType: string; // نوع المستند (هوية، جواز سفر، إلخ)
  documentId?: string; // رقم المستند إن وجد
  status: 'pending' | 'approved' | 'rejected';
  user: mongoose.Types.ObjectId;
  contactInfo: {
    name: string;
    phoneNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  type: {
    type: String,
    required: [true, 'نوع الإبلاغ مطلوب'],
    enum: ['lost', 'found']
  },
  title: {
    type: String,
    required: [true, 'عنوان الإبلاغ مطلوب'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'وصف الإبلاغ مطلوب'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'فئة المستند مطلوبة']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: [true, 'الإحداثيات مطلوبة [الطول، العرض]']
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب']
    }
  },
  date: {
    type: Date,
    required: [true, 'تاريخ الفقدان/العثور مطلوب']
  },
  images: [String],
  documentType: {
    type: String,
    required: [true, 'نوع المستند مطلوب']
  },
  documentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المستخدم مطلوب']
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'اسم جهة الاتصال مطلوب']
    },
    phoneNumber: {
      type: String,
      required: [true, 'رقم هاتف جهة الاتصال مطلوب']
    }
  }
},
{
  timestamps: true
});

// إضافة فهرس جغرافي للموقع
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model<IReport>('Report', reportSchema);

export default Report;