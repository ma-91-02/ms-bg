import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// تعريف واجهة الأدمن
export interface IAdmin extends Document {
  username: string;
  password: string;
  role: 'admin' | 'super';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// إنشاء مخطط الأدمن
const adminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
adminSchema.pre('save', async function(next) {
  // فقط تشفير كلمة المرور إذا تم تعديلها
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// طريقة للتحقق من كلمة المرور
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;