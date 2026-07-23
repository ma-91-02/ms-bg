import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// السكربت يعمل خارج التطبيق فلا يمر بـ index.ts الذي يحمّل البيئة
dotenv.config();

/**
 * بيانات تجريبية للتطوير.
 *
 * الزوجان الأولان مقصودان: «أحمد علي حسن» في إعلان مفقود و«احمد علي حسن»
 * (بلا همزة) في إعلان موجود — المطابقة النصية القديمة كانت تفشل أمامهما،
 * و`normalize_ar` تجعلهما متطابقين تمامًا.
 */
const prisma = new PrismaClient();

const hash = (p: string) => bcrypt.hash(p, 10);

async function main() {
  console.log('🌱 زراعة بيانات تجريبية...');

  const admin = await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: await hash(process.env.ADMIN_PASSWORD || 'admin_dev_password'),
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      fullName: 'مدير النظام',
      role: 'superadmin',
    },
  });

  const usersData = [
    { phoneNumber: '+9647701111111', fullName: 'أحمد علي حسن' },
    { phoneNumber: '+9647702222222', fullName: 'سارة جاسم محمد' },
    { phoneNumber: '+9647703333333', fullName: 'فاطمة عبد الرزاق' },
    { phoneNumber: '+9647704444444', fullName: 'يوسف كاظم' },
  ];

  const users = [];
  for (const u of usersData) {
    users.push(
      await prisma.user.upsert({
        where: { phoneNumber: u.phoneNumber },
        update: {},
        create: { ...u, password: await hash('Password123'), isProfileComplete: true },
      })
    );
  }

  const ads = [
    {
      userId: users[0].id,
      type: 'lost' as const,
      category: 'passport' as const,
      governorate: 'baghdad' as const,
      ownerName: 'أحمد علي حسن',
      itemNumber: 'A12345678',
      description: 'جواز سفر عراقي مفقود قرب ساحة التحرير في بغداد',
      contactPhone: '+9647701111111',
      isApproved: true,
      status: 'approved' as const,
    },
    {
      // نفس الاسم بلا همزة — الحالة التي كانت تفشل سابقًا
      userId: users[1].id,
      type: 'found' as const,
      category: 'passport' as const,
      governorate: 'baghdad' as const,
      ownerName: 'احمد علي حسن',
      itemNumber: 'A12345678',
      description: 'عثرت على جواز سفر عراقي في منطقة الكرادة',
      contactPhone: '+9647702222222',
      isApproved: true,
      status: 'approved' as const,
    },
    {
      userId: users[2].id,
      type: 'lost' as const,
      category: 'national_id' as const,
      governorate: 'basra' as const,
      ownerName: 'فاطمة عبد الرزاق',
      itemNumber: 'ID998877',
      description: 'بطاقة وطنية مفقودة في سوق البصرة المركزي',
      contactPhone: '+9647703333333',
      isApproved: false,
      status: 'pending' as const,
    },
    {
      userId: users[3].id,
      type: 'found' as const,
      category: 'driving_license' as const,
      governorate: 'nineveh' as const,
      ownerName: 'مصطفى إبراهيم',
      itemNumber: 'DL445566',
      description: 'إجازة سوق وُجدت قرب جامعة الموصل',
      contactPhone: '+9647704444444',
      isApproved: false,
      status: 'pending' as const,
    },
  ];

  for (const ad of ads) {
    const exists = await prisma.advertisement.findFirst({
      where: { itemNumber: ad.itemNumber, type: ad.type },
    });
    if (!exists) await prisma.advertisement.create({ data: ad });
  }

  console.log(`✅ مشرف: ${admin.username}`);
  console.log(`✅ ${users.length} مستخدمين · ${ads.length} إعلانات`);
}

main()
  .catch((e) => {
    console.error('❌ فشلت الزراعة:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
