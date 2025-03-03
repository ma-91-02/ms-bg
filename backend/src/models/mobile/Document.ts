import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  type: 'lost' | 'found';
  documentType: string;
  ownerName: string;
  governorate: string;
  description: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  governorate: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);
