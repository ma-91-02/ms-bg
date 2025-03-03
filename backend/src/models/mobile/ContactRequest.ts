import mongoose, { Schema, Document } from 'mongoose';

export interface IContactRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  documentOwnerId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  rejectionReason?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema: Schema = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentOwnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.model<IContactRequest>('ContactRequest', ContactRequestSchema); 