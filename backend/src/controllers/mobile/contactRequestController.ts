import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ContactRequest, { ContactRequestStatus } from '../../models/mobile/ContactRequest';
import Advertisement from '../../models/mobile/Advertisement';
import { AuthRequest } from '../../types/express';

// إنشاء طلب تواصل جديد
export const createContactRequest = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const { advertisementId, reason } = req.body;

    if (!advertisementId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'معرف الإعلان وسبب طلب التواصل مطلوبان'
      });
    }

    // التحقق من وجود الإعلان
    const advertisement = await Advertisement.findById(advertisementId);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    // التحقق من أن المستخدم لا يحاول التواصل مع إعلان خاص به
    if (advertisement.userId.toString() === authReq.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن طلب التواصل مع إعلان خاص بك'
      });
    }

    // التحقق من عدم وجود طلب تواصل سابق لم يتم البت فيه
    const existingRequest = await ContactRequest.findOne({
      userId: authReq.user.id,
      advertisementId,
      status: ContactRequestStatus.PENDING
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'لديك طلب تواصل قيد الانتظار لهذا الإعلان'
      });
    }

    // إنشاء طلب تواصل جديد
    const contactRequest = new ContactRequest({
      userId: authReq.user.id,
      advertisementId,
      advertiserUserId: advertisement.userId,
      reason
    });

    await contactRequest.save();

    return res.status(201).json({
      success: true,
      message: 'تم إرسال طلب التواصل بنجاح وفي انتظار موافقة الإدارة',
      data: contactRequest
    });
  } catch (error: any) {
    console.error('خطأ في إنشاء طلب التواصل:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على طلبات التواصل الخاصة بالمستخدم
export const getUserContactRequests = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    // إنشاء فلتر البحث
    const filter: any = { userId: authReq.user.id };
    
    if (status) {
      filter.status = status;
    }

    // الحصول على إجمالي عدد الطلبات
    const total = await ContactRequest.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب الطلبات
    const contactRequests = await ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('advertisementId', 'type category governorate description')
      .populate('advertiserUserId', 'fullName');

    return res.status(200).json({
      success: true,
      count: contactRequests.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: contactRequests
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على طلبات التواصل:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على معلومات التواصل (إذا تمت الموافقة على الطلب)
export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const { requestId } = req.params;

    // التحقق من وجود الطلب وأنه خاص بالمستخدم
    const contactRequest = await ContactRequest.findOne({
      _id: requestId,
      userId: authReq.user.id
    });

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود أو غير مصرح به'
      });
    }

    // التحقق من حالة الطلب
    if (contactRequest.status !== ContactRequestStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'لم تتم الموافقة على طلب التواصل بعد'
      });
    }

    // الحصول على معلومات التواصل
    const advertisement = await Advertisement.findById(contactRequest.advertisementId)
      .populate('userId', 'fullName phoneNumber');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    // إرجاع معلومات التواصل
    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على طلب التواصل',
      data: {
        advertiserName: advertisement.userId.fullName || 'غير متوفر',
        contactPhone: advertisement.contactPhone,
        userPhone: advertisement.userId.phoneNumber || 'غير متوفر'
      }
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على معلومات التواصل:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 