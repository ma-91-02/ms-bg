import dotenv from 'dotenv';
import prisma from '../config/prisma';

/**
 * تهيئة بيئة الاختبار.
 *
 * كانت تعتمد على `mongodb-memory-server`. مع Postgres لا يوجد مكافئ داخل
 * الذاكرة، فالاختبارات تعمل على قاعدة بيانات حقيقية منفصلة:
 *
 *   docker exec ms-bg-postgres createdb -U msbg ms_main_db_test
 *   DATABASE_URL=...ms_main_db_test npx prisma migrate deploy
 *
 * التنظيف بين الاختبارات بـ TRUNCATE ... CASCADE — أسرع من الحذف صفًا صفًا
 * ويحافظ على البنية والفهارس.
 */

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_at_least_32_characters_x';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'admin';
process.env.DEMO_MODE = 'false';

/** كل الجداول عدا سجل ترحيلات Prisma */
const TABLES = [
  'points_entries',
  'notifications',
  'favorites',
  'contact_requests',
  'advertisement_matches',
  'advertisements',
  'otps',
  'users',
  'admins',
];

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
