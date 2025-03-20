import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  phoneNumber: string;
  fullName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  birthDate?: Date;
  address?: string;
  profileImage?: string;
  isBlocked: boolean;
  points: number;
  isAdmin?: boolean;
  otp?: string;
  otpExpires?: Date;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'يرجى تقديم بريد إلكتروني صالح'
    }
  },
  password: {
    type: String,
    minlength: [6, 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل']
  },
  birthDate: {
    type: Date
  },
  address: {
    type: String
  },
  profileImage: {
    type: String
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
  }
}, {
  timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  const user = this;
  
  // فقط إذا تم تعديل كلمة المرور أو كانت جديدة
  if (user.password && (user.isModified('password') || user.isNew)) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      next();
    } catch (error) {
      return next(error as Error);
    }
  } else {
    return next();
  }
});

// طريقة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  try {
    // إذا لم يكن لدى المستخدم كلمة مرور (تم إنشاؤه من OTP فقط)
    if (!this.password) {
      return false;
    }
    
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;