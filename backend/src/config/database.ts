import { connectDatabase, disconnectDatabase } from './prisma';

/**
 * الاتصال بقاعدة بيانات PostgreSQL.
 *
 * أُبقي الاسم `connectDB` والتصدير الافتراضي كما كانا مع Mongoose
 * حتى لا تتغير مواضع الاستدعاء.
 */
const connectDB = async (): Promise<void> => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    throw error;
  }
};

export { disconnectDatabase };
export default connectDB;
