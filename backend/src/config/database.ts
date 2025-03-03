import mongoose from 'mongoose';
import validateEnv from './validateEnv';

const env = validateEnv();

/**
 * الاتصال بقاعدة بيانات MongoDB
 */
const connectDB = async (): Promise<void> => {
  try {
    // إعدادات الاتصال المتقدمة
    const options: mongoose.ConnectOptions = {
      // إعدادات اختيارية لتحسين الاتصال
    };

    await mongoose.connect(env.MONGODB_URI, options);
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    throw error;
  }
};

export default connectDB; 