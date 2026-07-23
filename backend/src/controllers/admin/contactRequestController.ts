import { Response } from 'express';
import { Prisma, ContactRequestStatus as Status } from '@prisma/client';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../types/express';
import { ContactRequestStatus } from '../../models/mobile/ContactRequest';
import * as notificationService from '../../services/mobile/notificationService';
import { NotificationType } from '../../types/mobile/notifications';

/** الحقول المرتبطة التي تُرجَع مع كل طلب — كانت ثلاث populate متتابعة */
const requestInclude = {
  user: { select: { id: true, fullName: true, phoneNumber: true } },
  advertisement: {
    select: { id: true, type: true, category: true, governorate: true, description: true },
  },
  advertiserUser: { select: { id: true, fullName: true, phoneNumber: true } },
} satisfies Prisma.ContactRequestInclude;

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

/** جلب مُصفَّح لطلبات التواصل — أساس getPending و getAll معًا */
const listRequests = async (
  res: Response,
  where: Prisma.ContactRequestWhereInput,
  page: number,
  limit: number,
  order: 'asc' | 'desc'
) => {
  const [total, contactRequests] = await prisma.$transaction([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
      include: requestInclude,
    }),
  ]);

  return res.status(200).json({
    success: true,
    count: contactRequests.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: contactRequests,
  });
};

const parsePaging = (req: AuthRequest) => ({
  page: Math.max(1, Number(req.query.page) || 1),
  limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)),
});

export const getPendingContactRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);
    // الأقدم أولًا — الطلبات المعلقة تُعالَج بترتيب ورودها
    return await listRequests(res, { status: ContactRequestStatus.PENDING }, page, limit, 'asc');
  } catch (error: any) {
    console.error('❌ خطأ في الحصول على طلبات التواصل المعلقة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAllContactRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { page, limit } = parsePaging(req);

    const where: Prisma.ContactRequestWhereInput = {};
    const status = req.query.status as string | undefined;

    // التحقق من صحة الحالة — سابقًا كانت تُمرَّر للاستعلام كما وردت
    if (status) {
      if (!Object.values(Status).includes(status as Status)) {
        return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
      }
      where.status = status as Status;
    }

    return await listRequests(res, where, page, limit, 'desc');
  } catch (error: any) {
    console.error('❌ خطأ في الحصول على طلبات التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * تغيير حالة طلب تواصل مع إشعار صاحب الطلب.
 *
 * الشرط `status: PENDING` جزء من الاستعلام لا فحص قبله: سابقًا كان
 * القراءة ثم الفحص ثم الحفظ ثلاث خطوات منفصلة، فطلبان متزامنان قد
 * يعالجان الطلب نفسه مرتين. الآن التحديث الشرطي ذرّي.
 */
const decideRequest = async (
  req: AuthRequest,
  res: Response,
  decision: 'approve' | 'reject'
) => {
  const { id } = req.params;
  const approving = decision === 'approve';

  const result = await prisma.contactRequest.updateMany({
    where: { id, status: ContactRequestStatus.PENDING },
    data: approving
      ? {
          status: ContactRequestStatus.APPROVED,
          approvedById: req.admin!.id,
          approvedAt: new Date(),
        }
      : {
          status: ContactRequestStatus.REJECTED,
          rejectionReason: req.body?.rejectionReason || 'غير موافق عليه من قبل الإدارة',
        },
  });

  if (result.count === 0) {
    const exists = await prisma.contactRequest.findUnique({ where: { id } });
    return exists
      ? res.status(400).json({ success: false, message: 'تم معالجة هذا الطلب مسبقًا' })
      : res.status(404).json({ success: false, message: 'طلب التواصل غير موجود' });
  }

  const contactRequest = await prisma.contactRequest.findUnique({
    where: { id },
    include: requestInclude,
  });

  // إشعار صاحب الطلب بالقرار — لم يكن يُرسَل سابقًا رغم وجود أنواع إشعارات له
  await notificationService
    .createNotification({
      userId: contactRequest!.userId,
      title: approving ? 'تمت الموافقة على طلب التواصل' : 'رُفض طلب التواصل',
      body: approving
        ? 'يمكنك الآن الاطلاع على معلومات التواصل الخاصة بصاحب الإعلان'
        : contactRequest!.rejectionReason || 'رُفض طلبك من قبل الإدارة',
      type: approving ? NotificationType.CONTACT_APPROVED : NotificationType.CONTACT_REJECTED,
      referenceId: contactRequest!.id,
    })
    .catch((e) => console.error('تعذّر إرسال إشعار القرار:', e));

  return res.status(200).json({
    success: true,
    message: approving
      ? 'تمت الموافقة على طلب التواصل بنجاح'
      : 'تم رفض طلب التواصل بنجاح',
    data: contactRequest,
  });
};

export const approveContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    return await decideRequest(req, res, 'approve');
  } catch (error: any) {
    console.error('خطأ في الموافقة على طلب التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const rejectContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    return await decideRequest(req, res, 'reject');
  } catch (error: any) {
    console.error('خطأ في رفض طلب التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
