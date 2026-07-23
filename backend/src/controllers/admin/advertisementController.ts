import { Response } from 'express';
import {
  Prisma,
  AdvertisementType as AdType,
  ItemCategory as Category,
  Governorate as Gov,
  AdvertisementStatus as Status,
} from '@prisma/client';
import prisma from '../../config/prisma';
import { AdvertisementStatus } from '../../models/mobile/Advertisement';
import { AuthRequest } from '../../types/express';
import { checkForMatches } from '../../services/common/matchingService';
import * as notificationService from '../../services/mobile/notificationService';
import { NotificationType } from '../../types/mobile/notifications';

const ownerSelect = {
  user: { select: { id: true, fullName: true, phoneNumber: true } },
} satisfies Prisma.AdvertisementInclude;

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

/** يبني فلاتر الاستعلام بعد التحقق من صلاحية كل قيمة مقابل تعدادها */
const buildFilters = (query: AuthRequest['query']): Prisma.AdvertisementWhereInput => {
  const where: Prisma.AdvertisementWhereInput = {};

  const { type, category, governorate, status, isResolved } = query as Record<
    string,
    string | undefined
  >;

  // سابقًا كانت القيم تُمرَّر إلى الاستعلام كما وردت من العميل بلا تحقق
  if (type && Object.values(AdType).includes(type as AdType)) where.type = type as AdType;
  if (category && Object.values(Category).includes(category as Category))
    where.category = category as Category;
  if (governorate && Object.values(Gov).includes(governorate as Gov))
    where.governorate = governorate as Gov;
  if (status && Object.values(Status).includes(status as Status))
    where.status = status as Status;
  if (isResolved !== undefined) where.isResolved = isResolved === 'true';

  return where;
};

const listAdvertisements = async (
  res: Response,
  where: Prisma.AdvertisementWhereInput,
  page: number,
  limit: number,
  order: 'asc' | 'desc'
) => {
  const [total, advertisements] = await prisma.$transaction([
    prisma.advertisement.count({ where }),
    prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
      include: ownerSelect,
    }),
  ]);

  return res.status(200).json({
    success: true,
    count: advertisements.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: advertisements,
  });
};

/**
 * الإعلانات بانتظار الموافقة.
 * أُضيف فحص صلاحية المشرف — كان غائبًا هنا وحده من بين كل دوال هذا الملف،
 * أي أن أي شخص كان يستطيع قراءة الإعلانات المعلّقة ببيانات أصحابها.
 */
export const getPendingAdvertisements = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);
    return await listAdvertisements(
      res,
      { status: AdvertisementStatus.PENDING },
      page,
      limit,
      'asc'
    );
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * الموافقة على إعلان.
 *
 * علّة أُصلحت هنا: المطابقة كانت تُستدعى عند إنشاء الإعلان فقط، بينما
 * `findPotentialMatches` يتخطى أي إعلان غير معتمد — والإعلان يُنشأ دائمًا
 * غير معتمد. النتيجة أن المطابقة التلقائية لم تكن تنتج شيئًا إطلاقًا،
 * ولا تعمل إلا بتشغيل يدوي من مسار الإدارة. صارت تُستدعى عند الاعتماد.
 */
export const approveAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    const advertisement = await prisma.advertisement
      .update({
        where: { id },
        data: {
          isApproved: true,
          status: AdvertisementStatus.APPROVED,
          approvedAt: new Date(),
          approvedById: req.admin!.id,
          rejectionReason: null,
        },
        include: ownerSelect,
      })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null;
        throw e;
      });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    // الآن فقط صار الإعلان مؤهلًا للمطابقة
    checkForMatches(advertisement.id);

    await notificationService
      .createNotification({
        userId: advertisement.userId,
        title: 'تمت الموافقة على إعلانك',
        body: 'إعلانك ظاهر الآن للمستخدمين، وسنُعلمك عند العثور على تطابق محتمل',
        type: NotificationType.ADVERTISEMENT,
        referenceId: advertisement.id,
      })
      .catch((e) => console.error('تعذّر إرسال إشعار الموافقة:', e));

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على الإعلان بنجاح',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('خطأ في الموافقة على الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const rejectAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const rejectionReason = req.body?.rejectionReason || 'مخالف للشروط والأحكام';

    const advertisement = await prisma.advertisement
      .update({
        where: { id },
        data: {
          isApproved: false,
          status: AdvertisementStatus.REJECTED,
          rejectionReason,
        },
        include: ownerSelect,
      })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null;
        throw e;
      });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    await notificationService
      .createNotification({
        userId: advertisement.userId,
        title: 'لم تتم الموافقة على إعلانك',
        body: rejectionReason,
        type: NotificationType.ADVERTISEMENT,
        referenceId: advertisement.id,
      })
      .catch((e) => console.error('تعذّر إرسال إشعار الرفض:', e));

    return res.status(200).json({
      success: true,
      message: 'تم رفض الإعلان بنجاح',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('خطأ في رفض الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAllAdvertisements = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);
    return await listAdvertisements(res, buildFilters(req.query), page, limit, 'desc');
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAdvertisementById = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: req.params.id },
      include: ownerSelect,
    });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    return res.status(200).json({ success: true, data: advertisement });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/** الحقول التي يُسمح للمشرف بتعديلها — بديل نسخ كل مفاتيح جسم الطلب */
const EDITABLE_FIELDS = [
  'type',
  'category',
  'governorate',
  'ownerName',
  'itemNumber',
  'description',
  'contactPhone',
  'hideContactInfo',
] as const;

/**
 * تعديل إعلان.
 *
 * كان الكود ينسخ كل مفاتيح `req.body` عدا ثلاثة مستثناة — أي إسناد جماعي
 * يسمح بكتابة حقول لم يُقصد كشفها (isApproved، approvedById، isDeleted…).
 * صارت القائمة بيضاء صريحة.
 */
export const updateAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    const data: Prisma.AdvertisementUpdateInput = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body?.[field] !== undefined) {
        (data as any)[field] = req.body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد حقول صالحة للتحديث' });
    }

    const advertisement = await prisma.advertisement
      .update({ where: { id }, data, include: ownerSelect })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null;
        throw e;
      });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الإعلان بنجاح',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('خطأ في تحديث الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const deleteAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    // المطابقات والمفضلة وطلبات التواصل المرتبطة تُحذف بـ onDelete: Cascade
    const deleted = await prisma.advertisement
      .delete({ where: { id: req.params.id } })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null;
        throw e;
      });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    return res.status(200).json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (error: any) {
    console.error('خطأ في حذف الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const markAsResolved = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { isResolved } = req.body;

    if (isResolved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير حالة الحل (isResolved)',
      });
    }

    const resolving = isResolved === true || isResolved === 'true';

    const advertisement = await prisma.advertisement
      .update({
        where: { id },
        data: {
          isResolved: resolving,
          status: resolving ? AdvertisementStatus.RESOLVED : AdvertisementStatus.APPROVED,
          resolvedAt: resolving ? new Date() : null,
        },
        include: ownerSelect,
      })
      .catch((e: any) => {
        if (e?.code === 'P2025') return null;
        throw e;
      });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    return res.status(200).json({
      success: true,
      message: resolving
        ? 'تم تحديث حالة الإعلان إلى "تم الحل"'
        : 'تم إعادة فتح الإعلان',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('خطأ في تحديث حالة الإعلان:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAdvertisementsByStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { status } = req.params;
    const { page, limit } = parsePaging(req);

    const statusFilters: Record<string, Prisma.AdvertisementWhereInput> = {
      pending: { isApproved: false },
      approved: { isApproved: true, isResolved: false },
      resolved: { isResolved: true },
    };

    const statusFilter = statusFilters[status];

    if (!statusFilter) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة. الحالات المتاحة: pending, approved, resolved',
      });
    }

    return await listAdvertisements(
      res,
      { ...statusFilter, ...buildFilters(req.query) },
      page,
      limit,
      'desc'
    );
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
