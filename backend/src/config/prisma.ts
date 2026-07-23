import { PrismaClient } from '@prisma/client';

/**
 * عميل Prisma مفرد (singleton).
 *
 * السبب: ts-node-dev يعيد تحميل الوحدات عند كل تعديل، وبدون تخزينه على
 * globalThis يُنشأ عميل جديد في كل مرة حتى تُستنفد اتصالات Postgres.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

/**
 * التحقق من الاتصال عند الإقلاع — يفشل بصوت عالٍ بدل الفشل الصامت
 * عند أول استعلام كما كان يحدث مع connectDB السابقة.
 */
export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL successfully');
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
