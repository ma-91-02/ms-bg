import { Request, Response } from 'express';
import ContactRequest, { ContactRequestStatus } from '../../models/mobile/ContactRequest';
import { AuthRequest } from '../../types/express';

// الحصول على قائمة طلبات التواصل المعلقة
export const getPendingContactRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { page = 1, limit = 10 } = req.query;

    // بناء الفلتر - فقط الطلبات المعلقة
    const filter = { status: ContactRequestStatus.PENDING };

    // الحصول على إجمالي عدد الطلبات
    const total = await ContactRequest.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب الطلبات
    const contactRequests = await ContactRequest.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'fullName phoneNumber')
      .populate('advertisementId', 'type category governorate description')
      .populate('advertiserUserId', 'fullName phoneNumber');

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

// الحصول على جميع طلبات التواصل
export const getAllContactRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    // بناء الفلتر
    const filter: any = {};
    
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
      .populate('userId', 'fullName phoneNumber')
      .populate('advertisementId', 'type category governorate description')
      .populate('advertiserUserId', 'fullName phoneNumber');

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

// الموافقة على طلب تواصل
export const approveContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;

    // البحث عن الطلب
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود'
      });
    }

    // التحقق من حالة الطلب
    if (contactRequest.status !== ContactRequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'تم معالجة هذا الطلب مسبقًا'
      });
    }

    // تحديث حالة الطلب
    contactRequest.status = ContactRequestStatus.APPROVED;
    contactRequest.approvedBy = req.admin._id;
    contactRequest.approvedAt = new Date();
    
    await contactRequest.save();

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على طلب التواصل بنجاح',
      data: contactRequest
    });
  } catch (error: any) {
    console.error('خطأ في الموافقة على طلب التواصل:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// رفض طلب تواصل
export const rejectContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    // البحث عن الطلب
    const contactRequest = await ContactRequest.findById(id);

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود'
      });
    }

    // التحقق من حالة الطلب
    if (contactRequest.status !== ContactRequestStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'تم معالجة هذا الطلب مسبقًا'
      });
    }

    // تحديث حالة الطلب
    contactRequest.status = ContactRequestStatus.REJECTED;
    contactRequest.rejectionReason = rejectionReason || 'غير موافق عليه من قبل الإدارة';
    
    await contactRequest.save();

    return res.status(200).json({
      success: true,
      message: 'تم رفض طلب التواصل بنجاح',
      data: contactRequest
    });
  } catch (error: any) {
    console.error('خطأ في رفض طلب التواصل:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 