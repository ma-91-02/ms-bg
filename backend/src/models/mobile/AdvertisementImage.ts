import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisementImage extends Document {
  advertisementId: mongoose.Types.ObjectId;
  imageUrl: string;
  createdAt: Date;
}

const AdvertisementImageSchema: Schema = new Schema({
  advertisementId: {
    type: Schema.Types.ObjectId,
    ref: 'Advertisement',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

// إضافة فهرس
AdvertisementImageSchema.index({ advertisementId: 1 });

export default mongoose.model<IAdvertisementImage>('AdvertisementImage', AdvertisementImageSchema); 