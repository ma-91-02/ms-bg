import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import Report from '../../models/mobile/Report';
import * as matchingService from '../../services/matchingService';
import * as rewardService from '../../services/rewardService';
import { NotificationType } from '../../types/notifications';
import { createNotification } from '../../services/notificationService';

/**
 * إنشاء تقرير جديد
 */
export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    // التحقق من بيانات الإدخال
    const { type, title, description, category, location, contactInfo } = req.body;
    
    if (!type || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة (النوع، العنوان، الوصف، الفئة) يجب توفيرها'
      });
    }

    // إنشاء التقرير
    const report = await Report.create({
      userId: req.user._id,
      type, // مفقود أو موجود
      title,
      description,
      category,
      location: location || {},
      contactInfo: contactInfo || {},
      images: req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [],
      status: 'pending' // التقارير الجديدة تبدأ بحالة "معلقة"
    });

    // إضافة نقاط للمستخدم مقابل إنشاء تقرير
    await rewardService.addPointsToUser(
      req.user._id.toString(),
      rewardService.RewardType.CREATE_DOCUMENT,
      report._id.toString()
    );

    // البحث عن مطابقات محتملة للتقرير الجديد
    const potentialMatches = await matchingService.findPotentialMatches(report);
    
    res.status(201).json({
      success: true,
      data: report,
      potentialMatches: potentialMatches.length > 0 ? potentialMatches : undefined,
      message: 'تم إنشاء التقرير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء تقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء التقرير'
    });
  }
};

/**
 * الحصول على جميع تقارير المستخدم
 */
export const getUserReports = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب تقارير المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تقارير المستخدم'
    });
  }
};

/**
 * البحث في التقارير
 */
export const searchReports = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      type, category, keyword, status,
      latitude, longitude, distance,
      startDate, endDate
    } = req.query;

    // بناء استعلام البحث
    const query: any = { status: 'approved' }; // نعرض فقط التقارير المعتمدة

    // نوع التقرير (مفقود/موجود)
    if (type) {
      query.type = type;
    }

    // الفئة
    if (category) {
      query.category = category;
    }

    // البحث النصي في العنوان أو الوصف
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // حالة محددة (للمسؤولين فقط)
    if (status && req.user?.role === 'admin') {
      query.status = status;
    }

    // نطاق التاريخ
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    // البحث الجغرافي
    if (latitude && longitude && distance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(distance as string) * 1000 // تحويل الكيلومترات إلى أمتار
        }
      };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('خطأ في البحث عن التقارير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن التقارير'
    });
  }
};

/**
 * الحصول على تقرير محدد بواسطة المعرف
 */
export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على التقرير'
      });
    }

    // التحقق من الصلاحيات: فقط المالك أو المسؤول يمكنه رؤية التقارير غير المعتمدة
    if (report.status !== 'approved' && 
      (!req.user || (req.user._id.toString() !== report.userId.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول إلى هذا التقرير'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('خطأ في جلب التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقرير'
    });
  }
};

/**
 * تحديث تقرير
 */
export const updateReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { reportId } = req.params;
    
    // التحقق من وجود التقرير
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على التقرير'
      });
    }
    
    // التحقق من ملكية التقرير
    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية تعديل هذا التقرير'
      });
    }
    
    // تحديث التقرير
    const updates: any = {};
    
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.category) updates.category = req.body.category;
    if (req.body.location) updates.location = req.body.location;
    if (req.body.contactInfo) updates.contactInfo = req.body.contactInfo;
    
    // إضافة صور جديدة إذا تم تحميلها
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const newImages = (req.files as Express.Multer.File[]).map(file => file.path);
      updates.images = [...report.images, ...newImages];
    }
    
    // تحديث حالة التقرير
    if (req.user.role === 'admin' && req.body.status) {
      updates.status = req.body.status;
    } else {
      // إعادة التقرير إلى حالة معلقة إذا تم تحديثه من قبل المستخدم
      updates.status = 'pending';
    }
    
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { $set: updates },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedReport,
      message: 'تم تحديث التقرير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التقرير'
    });
  }
};

/**
 * حذف تقرير
 */
export const deleteReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { reportId } = req.params;
    
    // التحقق من وجود التقرير
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على التقرير'
      });
    }
    
    // التحقق من ملكية التقرير أو صلاحيات المسؤول
    if (report.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية حذف هذا التقرير'
      });
    }
    
    // حذف التقرير
    await Report.findByIdAndDelete(reportId);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف التقرير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التقرير'
    });
  }
};

/**
 * الإبلاغ عن تقرير غير مناسب
 */
export const flagReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { reportId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم سبب للإبلاغ'
      });
    }
    
    // التحقق من وجود التقرير
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على التقرير'
      });
    }
    
    // إضافة الإبلاغ إلى التقرير
    const flagInfo = {
      userId: req.user._id,
      reason,
      date: new Date()
    };
    
    await Report.findByIdAndUpdate(
      reportId,
      { $push: { flags: flagInfo } }
    );
    
    // إضافة نقاط للمستخدم مقابل الإبلاغ عن محتوى غير مناسب
    await rewardService.addPointsToUser(
      req.user._id.toString(),
      rewardService.RewardType.REPORT_INVALID,
      report._id.toString()
    );
    
    // إشعار المسؤول بالإبلاغ
    await createNotification({
      userId: report.userId,
      title: 'تم الإبلاغ عن تقريرك',
      body: `تم الإبلاغ عن تقريرك "${report.title}" بسبب: ${reason}`,
      type: NotificationType.ADMIN_MESSAGE,
      referenceId: report._id
    });
    
    res.status(200).json({
      success: true,
      message: 'تم الإبلاغ عن التقرير بنجاح'
    });
  } catch (error) {
    console.error('خطأ في الإبلاغ عن التقرير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الإبلاغ عن التقرير'
    });
  }
};

/**
 * تأكيد تطابق
 */
export const confirmMatch = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { matchId } = req.params;
    
    // تأكيد التطابق عبر خدمة المطابقة
    const result = await matchingService.confirmMatch(matchId, req.user._id.toString());
    
    // إضافة نقاط للمستخدم إذا تم التأكيد بنجاح
    if (result.success) {
      await rewardService.addPointsToUser(
        req.user._id.toString(),
        rewardService.RewardType.DOCUMENT_RETURNED,
        matchId
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تأكيد التطابق بنجاح',
      data: result
    });
  } catch (error) {
    console.error('خطأ في تأكيد التطابق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تأكيد التطابق'
    });
  }
};

/**
 * رفض تطابق
 */
export const rejectMatch = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { matchId } = req.params;
    const { reason } = req.body;
    
    // رفض التطابق عبر خدمة المطابقة
    const result = await matchingService.rejectMatch(matchId, req.user._id.toString(), reason);
    
    res.status(200).json({
      success: true,
      message: 'تم رفض التطابق بنجاح',
      data: result
    });
  } catch (error) {
    console.error('خطأ في رفض التطابق:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفض التطابق'
    });
  }
}; 