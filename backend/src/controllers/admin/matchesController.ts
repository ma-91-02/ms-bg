import { Response } from 'express';
import { Prisma, MatchStatus as Status } from '@prisma/client';
import prisma from '../../config/prisma';
import { MatchStatus } from '../../models/mobile/AdvertisementMatch';
import { AuthRequest } from '../../types/express';
import * as matchingService from '../../services/common/matchingService';
import * as notificationService from '../../services/mobile/notificationService';
import { NotificationType } from '../../types/mobile/notifications';

/** الحقول المرتبطة التي تُرجَع مع كل مطابقة */
const matchInclude = {
  lostAdvertisement: {
    select: {
      id: true,
      type: true,
      category: true,
      governorate: true,
      ownerName: true,
      itemNumber: true,
      description: true,
      images: true,
      userId: true,
      user: { select: { id: true, fullName: true, phoneNumber: true } },
    },
  },
  foundAdvertisement: {
    select: {
      id: true,
      type: true,
      category: true,
      governorate: true,
      ownerName: true,
      itemNumber: true,
      description: true,
      images: true,
      userId: true,
      user: { select: { id: true, fullName: true, phoneNumber: true } },
    },
  },
} satisfies Prisma.AdvertisementMatchInclude;

const requireAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      message: 'غير مصرح به. يجب تسجيل الدخول كمشرف',
    });
    return false;
  }
  return true;
};

const parsePaging = (req: AuthRequest) => ({
  page: Math.max(1, Number(req.query.page) || 1),
  limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)),
});

const listMatches = async (
  res: Response,
  where: Prisma.AdvertisementMatchWhereInput,
  page: number,
  limit: number,
  orderBy: Prisma.AdvertisementMatchOrderByWithRelationInput
) => {
  const [total, matches] = await prisma.$transaction([
    prisma.advertisementMatch.count({ where }),
    prisma.advertisementMatch.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: matchInclude,
    }),
  ]);

  return res.status(200).json({
    success: true,
    count: matches.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: matches,
  });
};

/** المطابقات المعلّقة — الأعلى درجةً أولًا لأنها الأجدر بالمراجعة */
export const getPendingMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);
    return await listMatches(
      res,
      { status: MatchStatus.PENDING },
      page,
      limit,
      { matchScore: 'desc' }
    );
  } catch (error: any) {
    console.error('خطأ في الحصول على المطابقات المعلقة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAllMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);

    const where: Prisma.AdvertisementMatchWhereInput = {};
    const status = req.query.status as string | undefined;

    if (status) {
      if (!Object.values(Status).includes(status as Status)) {
        return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
      }
      where.status = status as Status;
    }

    return await listMatches(res, where, page, limit, { createdAt: 'desc' });
  } catch (error: any) {
    console.error('خطأ في الحصول على المطابقات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * الموافقة على مطابقة.
 *
 * علّة أُصلحت هنا: «إرسال الإشعار» كان `console.log` فحسب، ومع ذلك
 * يُضبط `notificationSent = true`. أي أن صاحب المستمسك المفقود لم يكن
 * يعلم أبدًا بالعثور عليه — وهو جوهر الخدمة كلها.
 * الإشعار الآن يُنشأ فعليًا للطرفين، و`notificationSent` يعكس الحقيقة.
 */
export const approveMatch = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { notes } = req.body;

    // تحديث شرطي ذرّي — يمنع معالجة نفس المطابقة مرتين من طلبين متزامنين
    const updated = await prisma.advertisementMatch.updateMany({
      where: { id, status: MatchStatus.PENDING },
      data: {
        status: MatchStatus.APPROVED,
        approvedById: req.admin!.id,
        approvedAt: new Date(),
        ...(notes ? { notes } : {}),
      },
    });

    if (updated.count === 0) {
      const existing = await prisma.advertisementMatch.findUnique({ where: { id } });
      return existing
        ? res.status(400).json({
            success: false,
            message: `هذه المطابقة تم معالجتها مسبقًا وحالتها الحالية: ${existing.status}`,
          })
        : res.status(404).json({ success: false, message: 'المطابقة غير موجودة' });
    }

    const match = await prisma.advertisementMatch.findUnique({
      where: { id },
      include: matchInclude,
    });

    // إشعار الطرفين فعليًا
    try {
      await notificationService.createNotifications([
        {
          userId: match!.lostAdvertisement.userId,
          title: 'عُثر على مستمسك يطابق إعلانك',
          body: 'راجع تفاصيل المطابقة في التطبيق وقدّم طلب تواصل مع من عثر عليه',
          type: NotificationType.ADVERTISEMENT,
          referenceId: match!.id,
        },
        {
          userId: match!.foundAdvertisement.userId,
          title: 'المستمسك الذي عثرت عليه يطابق إعلان مفقود',
          body: 'شكرًا لك — سيتواصل معك صاحب المستمسك بعد موافقة الإدارة',
          type: NotificationType.ADVERTISEMENT,
          referenceId: match!.id,
        },
      ]);

      await prisma.advertisementMatch.update({
        where: { id },
        data: { notificationSent: true, notificationSentAt: new Date() },
      });
    } catch (notificationError) {
      // لا يُضبط notificationSent عند الفشل — الحقل يعكس الواقع
      console.error('خطأ في إرسال الإشعار:', notificationError);
    }

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على المطابقة بنجاح',
      data: match,
    });
  } catch (error: any) {
    console.error('خطأ في الموافقة على المطابقة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const rejectMatch = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { notes } = req.body;

    const updated = await prisma.advertisementMatch.updateMany({
      where: { id, status: MatchStatus.PENDING },
      data: { status: MatchStatus.REJECTED, ...(notes ? { notes } : {}) },
    });

    if (updated.count === 0) {
      const existing = await prisma.advertisementMatch.findUnique({ where: { id } });
      return existing
        ? res.status(400).json({ success: false, message: 'هذه المطابقة تم معالجتها مسبقًا' })
        : res.status(404).json({ success: false, message: 'المطابقة غير موجودة' });
    }

    const match = await prisma.advertisementMatch.findUnique({
      where: { id },
      include: matchInclude,
    });

    return res.status(200).json({
      success: true,
      message: 'تم رفض المطابقة بنجاح',
      data: match,
    });
  } catch (error: any) {
    console.error('خطأ في رفض المطابقة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const runMatchingForAll = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const created = await matchingService.runMatchingForAll();

    return res.status(200).json({
      success: true,
      message: `اكتملت المطابقة — ${created} مطابقة جديدة`,
      data: { created },
    });
  } catch (error: any) {
    console.error('خطأ في تشغيل المطابقة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const runMatchingForOne = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { advertisementId } = req.params;

    const exists = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
      select: { id: true },
    });

    if (!exists) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    const created = await matchingService.findPotentialMatches(advertisementId);

    return res.status(200).json({
      success: true,
      message: `اكتملت المطابقة — ${created} مطابقة جديدة`,
      data: { created },
    });
  } catch (error: any) {
    console.error('خطأ في تشغيل المطابقة للإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * تنظيف المطابقات المكررة.
 *
 * أُبقي المسار للتوافق مع لوحة التحكم الحالية، لكنه صار بلا عمل:
 * قيد `@@unique([lostAdvertisementId, foundAdvertisementId])` يمنع
 * إنشاء التكرار من الأساس بدل تنظيفه بعد وقوعه.
 */
export const cleanupDuplicateMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    return res.status(200).json({
      success: true,
      message: 'لا حاجة للتنظيف — قيد التفرّد في قاعدة البيانات يمنع المطابقات المكررة',
      removed: 0,
    });
  } catch (error: any) {
    console.error('خطأ في تنظيف المطابقات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/** سجل المطابقات المعالَجة (المعتمدة والمرفوضة والمكتملة) */
export const getMatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);

    return await listMatches(
      res,
      { status: { not: MatchStatus.PENDING } },
      page,
      limit,
      { approvedAt: 'desc' }
    );
  } catch (error: any) {
    console.error('خطأ في الحصول على سجل المطابقات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * إنشاء مطابقات يدوية جماعية.
 * يتحقق من وجود الإعلانين ومن أن أنواعهما متقابلة قبل الإنشاء.
 */
export const bulkCreateMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { matches } = req.body;

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير مصفوفة matches غير فارغة',
      });
    }

    const valid: Prisma.AdvertisementMatchCreateManyInput[] = [];
    const skipped: string[] = [];

    for (const item of matches) {
      const { lostAdvertisementId, foundAdvertisementId, matchScore, notes } = item ?? {};

      if (!lostAdvertisementId || !foundAdvertisementId) {
        skipped.push('معرّفا الإعلانين مطلوبان');
        continue;
      }

      const [lost, found] = await Promise.all([
        prisma.advertisement.findUnique({
          where: { id: lostAdvertisementId },
          select: { id: true, type: true },
        }),
        prisma.advertisement.findUnique({
          where: { id: foundAdvertisementId },
          select: { id: true, type: true },
        }),
      ]);

      if (!lost || !found) {
        skipped.push(`إعلان غير موجود: ${lostAdvertisementId} / ${foundAdvertisementId}`);
        continue;
      }

      if (lost.type !== 'lost' || found.type !== 'found') {
        skipped.push(`نوعا الإعلانين غير متقابلين: ${lost.id} / ${found.id}`);
        continue;
      }

      valid.push({
        lostAdvertisementId,
        foundAdvertisementId,
        matchScore: Number(matchScore) || 100, // مطابقة يدوية من مشرف
        matchingFields: ['manual'],
        status: MatchStatus.PENDING,
        notes: notes ?? 'مطابقة يدوية من الإدارة',
      });
    }

    const result = valid.length
      ? await prisma.advertisementMatch.createMany({ data: valid, skipDuplicates: true })
      : { count: 0 };

    return res.status(201).json({
      success: true,
      message: `أُنشئت ${result.count} مطابقة`,
      data: { created: result.count, skipped },
    });
  } catch (error: any) {
    console.error('خطأ في إنشاء المطابقات الجماعية:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
