import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  phoneNumber: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

const otpSchema = new Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'OTP code is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // OTP expires after 15 minutes (in seconds)
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  }
});

const Otp = mongoose.model<IOtp>('Otp', otpSchema);

export default Otp; 