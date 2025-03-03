import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  phoneNumber: string;
  otp?: string;
  otpExpires?: Date;
  userType?: 'finder' | 'loser';
  name?: string;
  idNumber?: string;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
  compareOTP(candidateOTP: string): boolean;
}

const userSchema = new Schema<IUser>({
  phoneNumber: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    unique: true,
    trim: true
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  userType: {
    type: String,
    enum: ['finder', 'loser']
  },
  name: {
    type: String
  },
  idNumber: {
    type: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, 
{
  timestamps: true
});

// التحقق مما إذا كان OTP صالحًا ولم تنتهي صلاحيته
userSchema.methods.compareOTP = function(candidateOTP: string): boolean {
  // إذا انتهت مدة صلاحية OTP
  if (this.otpExpires && this.otpExpires < new Date()) {
    return false;
  }
  
  // التحقق من مطابقة OTP
  return this.otp === candidateOTP;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;