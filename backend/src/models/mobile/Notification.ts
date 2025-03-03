import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '../../types/notifications';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: string;
  referenceId?: mongoose.Types.ObjectId;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  data: {
    type: Object
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// إضافة فهرس للمستخدم وحالة القراءة لتحسين استعلامات الإشعارات غير المقروءة
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 