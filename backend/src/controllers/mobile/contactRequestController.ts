import { Request, Response } from 'express';
import { Prisma, ContactRequestStatus as Status } from '@prisma/client';
import prisma from '../../config/prisma';
import { ContactRequestStatus } from '../../models/mobile/ContactRequest';
import { AuthRequest } from '../../types/express';

const requireUser = (req: Request, res: Response): string | null => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'غير مصرح به. يرجى تسجيل الدخول' });
    return null;
  }
  return userId;
};

/**
 * إنشاء طلب تواصل.
 *
 * قيد `@@unique([userId, advertisementId])` يحلّ محل الفحص المسبق:
 * سابقًا كان «ابحث عن طلب معلّق ثم أنشئ» خطوتين، فطلبان متزامنان من نفس
 * المستخدم يمرّان معًا. الآن التفرّد مفروض من قاعدة البيانات.
 */
export const createContactRequest = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { advertisementId, reason } = req.body;

    if (!advertisementId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'معرف الإعلان وسبب طلب التواصل مطلوبان',
      });
    }

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
      select: { id: true, userId: true },
    });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }

    if (advertisement.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن طلب التواصل مع إعلان خاص بك',
      });
    }

    try {
      const contactRequest = await prisma.contactRequest.create({
        data: {
          userId,
          advertisementId,
          advertiserUserId: advertisement.userId,
          reason,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'تم إرسال طلب التواصل بنجاح وفي انتظار موافقة الإدارة',
        data: contactRequest,
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'لديك طلب تواصل سابق لهذا الإعلان',
        });
      }
      throw e;
    }
  } catch (error: any) {
    console.error('❌ خطأ غير متوقع في إنشاء طلب التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getUserContactRequests = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const status = req.query.status as string | undefined;

    const where: Prisma.ContactRequestWhereInput = { userId };

    if (status) {
      if (!Object.values(Status).includes(status as Status)) {
        return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
      }
      where.status = status as Status;
    }

    const [total, contactRequests] = await prisma.$transaction([
      prisma.contactRequest.count({ where }),
      prisma.contactRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          advertisement: {
            select: {
              id: true,
              type: true,
              category: true,
              governorate: true,
              description: true,
            },
          },
          advertiserUser: { select: { id: true, fullName: true } },
        },
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
  } catch (error: any) {
    console.error('خطأ في الحصول على طلبات التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/**
 * كشف معلومات التواصل بعد موافقة الإدارة.
 *
 * الشروط الثلاثة (الطلب موجود · يخص هذا المستخدم · معتمَد) صارت في
 * استعلام واحد بدل ثلاث قراءات متتابعة — وهذا هو المسار الحساس للخصوصية
 * في التطبيق كله، فتقليل خطواته يقلّل احتمال تسريبه.
 */
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { requestId } = req.params;

    const contactRequest = await prisma.contactRequest.findFirst({
      where: { id: requestId, userId },
      include: {
        advertisement: {
          select: {
            contactPhone: true,
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
      },
    });

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود أو غير مصرح به',
      });
    }

    if (contactRequest.status !== ContactRequestStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'لم تتم الموافقة على طلب التواصل بعد',
      });
    }

    const { advertisement } = contactRequest;

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على طلب التواصل',
      data: {
        advertiserName: advertisement.user.fullName || 'غير متوفر',
        contactPhone: advertisement.contactPhone,
        userPhone: advertisement.user.phoneNumber || 'غير متوفر',
      },
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على معلومات التواصل:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
