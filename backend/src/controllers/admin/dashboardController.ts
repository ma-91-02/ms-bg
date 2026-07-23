import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import prisma from '../../config/prisma';

/**
 * إحصائيات لوحة التحكم.
 *
 * كانت 15 عملية عدّ متسلسلة، كلٌّ منها ذهاب وإياب مستقل إلى قاعدة البيانات
 * (`await` داخل حرفيّ كائن ينفَّذ تتابعًا لا توازيًا). صارت معاملة واحدة
 * تُنفَّذ دفعةً واحدة.
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف',
      });
    }

    const adSelect = {
      id: true,
      category: true,
      ownerName: true,
      itemNumber: true,
      user: { select: { fullName: true } },
    } as const;

    const [
      usersCount,
      adsTotal,
      adsPending,
      adsApproved,
      adsResolved,
      adsLost,
      adsFound,
      matchesTotal,
      matchesPending,
      matchesApproved,
      matchesRejected,
      contactsTotal,
      contactsPending,
      contactsApproved,
      contactsRejected,
      latestPendingAds,
      latestMatches,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { isApproved: false } }),
      prisma.advertisement.count({ where: { isApproved: true, isResolved: false } }),
      prisma.advertisement.count({ where: { isResolved: true } }),
      prisma.advertisement.count({ where: { type: 'lost' } }),
      prisma.advertisement.count({ where: { type: 'found' } }),
      prisma.advertisementMatch.count(),
      prisma.advertisementMatch.count({ where: { status: 'pending' } }),
      prisma.advertisementMatch.count({ where: { status: 'approved' } }),
      prisma.advertisementMatch.count({ where: { status: 'rejected' } }),
      prisma.contactRequest.count(),
      prisma.contactRequest.count({ where: { status: 'pending' } }),
      prisma.contactRequest.count({ where: { status: 'approved' } }),
      prisma.contactRequest.count({ where: { status: 'rejected' } }),
      prisma.advertisement.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { fullName: true, phoneNumber: true } } },
      }),
      prisma.advertisementMatch.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          lostAdvertisement: { select: adSelect },
          foundAdvertisement: { select: adSelect },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        usersCount,
        ads: {
          total: adsTotal,
          pending: adsPending,
          approved: adsApproved,
          resolved: adsResolved,
          lost: adsLost,
          found: adsFound,
        },
        matches: {
          total: matchesTotal,
          pending: matchesPending,
          approved: matchesApproved,
          rejected: matchesRejected,
        },
        contactRequests: {
          total: contactsTotal,
          pending: contactsPending,
          approved: contactsApproved,
          rejected: contactsRejected,
        },
        latestPendingAds,
        latestMatches,
      },
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
    });
  }
};
