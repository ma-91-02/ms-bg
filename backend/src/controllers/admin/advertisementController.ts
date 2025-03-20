import { Request, Response } from 'express';
import Advertisement, { AdvertisementStatus } from '../../models/mobile/Advertisement';
import { AuthRequest } from '../../types/express';

// الحصول على قائمة الإعلانات بانتظار الموافقة
export const getPendingAdvertisements = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // بناء الفلتر - فقط الإعلانات بانتظار الموافقة
    const filter = { status: AdvertisementStatus.PENDING };

    // الحصول على إجمالي عدد الإعلانات
    const total = await Advertisement.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب الإعلانات مع الترتيب حسب الأقدم أولاً
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'fullName phoneNumber');

    return res.status(200).json({
      success: true,
      count: advertisements.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: advertisements
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الموافقة على إعلان
export const approveAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;

    // البحث عن الإعلان
    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    // تحديث حالة الإعلان
    advertisement.isApproved = true;
    advertisement.status = AdvertisementStatus.APPROVED;
    advertisement.approvedAt = new Date();
    advertisement.approvedBy = req.admin._id;
    
    await advertisement.save();

    return res.status(200).json({
      success: true,
      message: 'تمت الموافقة على الإعلان بنجاح',
      data: advertisement
    });
  } catch (error: any) {
    console.error('خطأ في الموافقة على الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// رفض إعلان
export const rejectAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    // البحث عن الإعلان
    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    // تحديث حالة الإعلان
    advertisement.isApproved = false;
    advertisement.status = AdvertisementStatus.REJECTED;
    advertisement.rejectionReason = rejectionReason || 'مخالف للشروط والأحكام';
    
    await advertisement.save();

    return res.status(200).json({
      success: true,
      message: 'تم رفض الإعلان بنجاح',
      data: advertisement
    });
  } catch (error: any) {
    console.error('خطأ في رفض الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على جميع الإعلانات (للمشرف)
export const getAllAdvertisements = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { 
      type, 
      category, 
      governorate, 
      status, 
      isResolved, 
      page = 1, 
      limit = 10 
    } = req.query;

    // بناء فلتر البحث
    const filter: any = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (governorate) filter.governorate = governorate;
    if (status) filter.status = status;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

    // الحصول على إجمالي عدد الإعلانات
    const total = await Advertisement.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب الإعلانات مع التصفية والترتيب حسب الأحدث
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'fullName phoneNumber');

    return res.status(200).json({
      success: true,
      count: advertisements.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: advertisements
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على إعلان محدد (للمشرف)
export const getAdvertisementById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const advertisement = await Advertisement.findById(req.params.id)
      .populate('userId', 'fullName phoneNumber');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    return res.status(200).json({
      success: true,
      data: advertisement
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تعديل إعلان (للمشرف)
export const updateAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    // تحديث معلومات الإعلان
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'userId' && key !== 'createdAt') {
        advertisement[key] = updateData[key];
      }
    });

    // توثيق أن التعديل تم بواسطة المشرف
    advertisement.approvedBy = req.admin._id;
    advertisement.approvedAt = new Date();
    
    await advertisement.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الإعلان بنجاح',
      data: advertisement
    });
  } catch (error: any) {
    console.error('خطأ في تحديث الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// حذف إعلان (للمشرف)
export const deleteAdvertisement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    await Advertisement.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'تم حذف الإعلان بنجاح'
    });
  } catch (error: any) {
    console.error('خطأ في حذف الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// تغيير حالة الإعلان إلى "تم الحل" (للمشرف)
export const markAsResolved = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { id } = req.params;
    const { isResolved } = req.body;

    if (isResolved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير حالة الحل (isResolved)'
      });
    }

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'الإعلان غير موجود'
      });
    }

    advertisement.isResolved = isResolved;
    advertisement.status = isResolved ? AdvertisementStatus.RESOLVED : AdvertisementStatus.APPROVED;
    advertisement.resolvedAt = isResolved ? new Date() : null;
    
    await advertisement.save();

    return res.status(200).json({
      success: true,
      message: isResolved ? 'تم تحديث حالة الإعلان إلى "تم الحل"' : 'تم إعادة فتح الإعلان',
      data: advertisement
    });
  } catch (error: any) {
    console.error('خطأ في تحديث حالة الإعلان:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
};

// الحصول على الإعلانات حسب الحالة
export const getAdvertisementsByStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف'
      });
    }

    const { status } = req.params; // pending, approved, rejected, resolved
    const { type, category, governorate, page = 1, limit = 10 } = req.query;

    // بناء فلتر البحث
    const filter: any = {};
    
    // تحديد الفلتر حسب الحالة
    switch (status) {
      case 'pending':
        filter.isApproved = false;
        break;
      case 'approved':
        filter.isApproved = true;
        filter.isResolved = false;
        break;
      case 'resolved':
        filter.isResolved = true;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'حالة غير صالحة. الحالات المتاحة: pending, approved, resolved'
        });
    }
    
    // إضافة فلاتر إضافية
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (governorate) filter.governorate = governorate;

    // الحصول على إجمالي عدد الإعلانات
    const total = await Advertisement.countDocuments(filter);

    // حساب التخطي والحد
    const skip = (Number(page) - 1) * Number(limit);
    
    // جلب الإعلانات
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'fullName phoneNumber');

    return res.status(200).json({
      success: true,
      count: advertisements.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: advertisements
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 