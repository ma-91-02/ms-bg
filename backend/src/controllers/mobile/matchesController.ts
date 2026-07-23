import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { MatchStatus } from '../../models/mobile/AdvertisementMatch';
import { AuthRequest } from '../../types/express';

/**
 * مطابقات المستخدم.
 *
 * علّة أُصلحت هنا: كان الاستعلام السابق يستخدم
 * `{ 'lostAdvertisementId.userId': userId }` — والنقطة في Mongo لا تعبر
 * المرجع (populate يحدث بعد التنفيذ لا أثناءه)، فكان الفلتر لا يطابق شيئًا
 * وقائمة المطابقات فارغة دائمًا. في Prisma الفلترة عبر العلاقة أصلية وصحيحة.
 */
export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول',
      });
    }

    const matches = await prisma.advertisementMatch.findMany({
      where: {
        status: MatchStatus.APPROVED,
        OR: [
          { lostAdvertisement: { userId } },
          { foundAdvertisement: { userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        lostAdvertisement: {
          select: {
            id: true,
            category: true,
            governorate: true,
            ownerName: true,
            itemNumber: true,
            description: true,
            images: true,
            userId: true,
            user: { select: { fullName: true } },
          },
        },
        foundAdvertisement: {
          select: {
            id: true,
            category: true,
            governorate: true,
            ownerName: true,
            itemNumber: true,
            description: true,
            images: true,
            userId: true,
            contactPhone: true,
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على المطابقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
    });
  }
};
