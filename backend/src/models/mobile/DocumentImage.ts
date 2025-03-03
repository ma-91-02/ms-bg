import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentImage extends Document {
  documentId: mongoose.Types.ObjectId;
  imageUrl: string;
  createdAt: Date;
}

const DocumentImageSchema: Schema = new Schema({
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model<IDocumentImage>('DocumentImage', DocumentImageSchema);