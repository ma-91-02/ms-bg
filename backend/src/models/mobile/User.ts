import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  phoneNumber: string;
  password: string;
  fullName: string;
  lastName?: string;
  email?: string;
  birthDate?: Date;
  points: number;
  isBlocked: boolean;
  isAdmin?: boolean;
  otp?: string;
  otpExpires?: Date;
  isProfileComplete: boolean;
  userType?: 'finder' | 'loser';
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: false
  },
  birthDate: {
    type: Date,
    required: false
  },
  points: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    required: false
  },
  otpExpires: {
    type: Date,
    required: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    enum: ['finder', 'loser'],
    required: false
  }
}, {
  timestamps: true
});

// هوك قبل الحفظ لتشفير كلمة المرور
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// طريقة مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;