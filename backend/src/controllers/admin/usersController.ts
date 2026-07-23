import { Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types/express';

/**
 * إدارة المستخدمين من لوحة التحكم.
 *
 * ملاحظتان على ما تغيّر:
 *  - كان التحقق من صحة المعرّف عبر `mongoose.Types.ObjectId.isValid`؛
 *    صار عدم وجود السجل يُعالَج بـ 404 مباشرةً.
 *  - حقول الحظر والحذف المنطقي (blockReason/blockedAt/isDeleted/…) كانت
 *    تُكتب هنا لكن مخطط Mongoose لا يعرّفها فتُحذف بصمت. صارت معرَّفة في
 *    مخطط Prisma، أي أن هذه الميزة تعمل فعليًا الآن لأول مرة.
 */

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

const notFound = (res: Response) =>
  res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { search, isBlocked, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));

    const where: Prisma.UserWhereInput = { isDeleted: false };

    if (search) {
      const term = String(search);
      // بحث غير حسّاس لحالة الأحرف — كان $regex مع الخيار 'i'
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phoneNumber: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
          isBlocked: true,
          createdAt: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users,
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على المستخدمين:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    const [user, totalAds, lostAds, foundAds, resolvedAds, contactRequests, recentAds] =
      await prisma.$transaction([
        prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            fullName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            birthDate: true,
            address: true,
            profileImage: true,
            points: true,
            isBlocked: true,
            blockReason: true,
            blockedAt: true,
            isProfileComplete: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.advertisement.count({ where: { userId: id } }),
        prisma.advertisement.count({ where: { userId: id, type: 'lost' } }),
        prisma.advertisement.count({ where: { userId: id, type: 'found' } }),
        prisma.advertisement.count({ where: { userId: id, isResolved: true } }),
        prisma.contactRequest.count({ where: { userId: id } }),
        prisma.advertisement.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            type: true,
            category: true,
            governorate: true,
            description: true,
            createdAt: true,
            isApproved: true,
            isResolved: true,
          },
        }),
      ]);

    if (!user) return notFound(res);

    return res.status(200).json({
      success: true,
      data: {
        user,
        stats: { totalAds, lostAds, foundAds, resolvedAds, contactRequests },
        recentAds,
      },
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على تفاصيل المستخدم:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const toggleBlockUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { isBlocked, blockReason } = req.body;

    if (isBlocked === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد حالة الحظر (isBlocked)',
      });
    }

    const blocking = isBlocked === true || isBlocked === 'true';

    const user = await prisma.user
      .update({
        where: { id },
        data: {
          isBlocked: blocking,
          blockReason: blocking ? blockReason || 'قرار إداري' : null,
          blockedAt: blocking ? new Date() : null,
          blockedById: blocking ? req.admin!.id : null,
        },
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          isBlocked: true,
          blockReason: true,
          blockedAt: true,
        },
      })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null; // السجل غير موجود
        throw e;
      });

    if (!user) return notFound(res);

    return res.status(200).json({
      success: true,
      message: `تم ${blocking ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`,
      data: { user },
    });
  } catch (error: any) {
    console.error('خطأ في تغيير حالة حظر المستخدم:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * حذف منطقي للمستخدم.
 *
 * الخطوتان (إخفاء هوية المستخدم + أرشفة إعلاناته) تجريان الآن داخل معاملة
 * واحدة: سابقًا كانتا كتابتين مستقلتين، وفشل الثانية يترك مستخدمًا محذوفًا
 * وإعلاناته حيّة ومعروضة.
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFound(res);

    if (user.isDeleted) {
      return res.status(400).json({ success: false, message: 'المستخدم محذوف بالفعل' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: req.admin!.id,
          // إخفاء البيانات الشخصية مع إبقاء قيد التفرّد صالحًا
          phoneNumber: `DELETED_${user.id}_${user.phoneNumber}`,
          email: user.email ? `DELETED_${user.id}_${user.email}` : null,
        },
      }),
      prisma.advertisement.updateMany({
        where: { userId: id },
        data: { isArchived: true, archivedReason: 'تم حذف المستخدم' },
      }),
    ]);

    return res.status(200).json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error: any) {
    console.error('خطأ في حذف المستخدم:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
