import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// تعريف واجهة الأدمن
export interface IAdmin extends Document {
  username: string;
  password: string;
  _id: mongoose.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// إنشاء مخطط الأدمن
const adminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: [true, 'يجب إدخال اسم المستخدم'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'يجب إدخال كلمة المرور'],
    select: false // لن يتم إرجاع كلمة المرور في الاستعلامات
  }
});

// تشفير كلمة المرور قبل الحفظ
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// دالة مقارنة كلمة المرور
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);