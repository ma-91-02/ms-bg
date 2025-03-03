import { Request, Response } from 'express';
import Report from '../../models/mobile/Report';

// إنشاء إبلاغ جديد
export const createReport = async (req: Request, res: Response) => {
  try {
    const {
      type, title, description, category, location,
      date, documentType, documentId, contactInfo
    } = req.body;
    
    // التحقق من وجود معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به - يرجى تسجيل الدخول'
      });
    }
    
    // إنشاء إبلاغ جديد مع حالة 'pending' (قيد الانتظار)
    const newReport = await Report.create({
      type,
      title,
      description,
      category,
      location,
      date,
      documentType,
      documentId,
      user: req.user.id,
      status: 'pending',
      contactInfo,
      images: []
    });
    
    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الإبلاغ بنجاح وهو قيد المراجعة',
      data: {
        report: newReport
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء الإبلاغ:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الإبلاغ'
    });
  }
};

// الحصول على إبلاغات المستخدم
export const getUserReports = async (req: Request, res: Response) => {
  try {
    // التحقق من وجود معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به - يرجى تسجيل الدخول'
      });
    }
    
    // البحث عن الإبلاغات الخاصة بالمستخدم
    const reports = await Report.find({ user: req.user.id });
    
    return res.status(200).json({
      success: true,
      results: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    console.error('خطأ في جلب إبلاغات المستخدم:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإبلاغات'
    });
  }
};

// البحث عن إبلاغات
export const searchReports = async (req: Request, res: Response) => {
  try {
    const {
      type, category, status = 'approved', 
      location, documentType, query
    } = req.query;
    
    // بناء استعلام البحث
    const searchQuery: any = { status };
    
    if (type) searchQuery.type = type;
    if (category) searchQuery.category = category;
    if (documentType) searchQuery.documentType = documentType;
    
    // إذا تم توفير موقع (إحداثيات)
    if (location) {
      try {
        const [lng, lat] = (location as string).split(',').map(coord => parseFloat(coord.trim()));
        const maxDistance = 5000; // 5 كيلومترات
        
        searchQuery.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        };
      } catch (e) {
        console.error('خطأ في تحليل الإحداثيات:', e);
      }
    }
    
    // البحث عن النص في العنوان أو الوصف
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // تنفيذ البحث
    const reports = await Report.find(searchQuery)
      .select('-user') // استبعاد معلومات المستخدم
      .sort('-createdAt');
    
    return res.status(200).json({
      success: true,
      results: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    console.error('خطأ في البحث عن تقارير:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن التقارير'
    });
  }
};

// رفع صور للإبلاغ
export const uploadReportImages = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    
    // التحقق من وجود معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به - يرجى تسجيل الدخول'
      });
    }
    
    // التحقق من وجود الملفات
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء تحديد صورة واحدة على الأقل'
      });
    }
    
    // التحقق من أن التقرير ينتمي للمستخدم الحالي
    const report = await Report.findOne({ 
      _id: reportId, 
      user: req.user.id 
    });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'التقرير غير موجود أو غير مصرح بالوصول إليه'
      });
    }
    
    // تحويل الملفات إلى مصفوفة (حتى لو كان ملفاً واحداً)
    const files = Array.isArray(req.files) ? req.files : [req.files];
    
    // استخراج مسارات الملفات
    const imagePaths = files.map(file => `/uploads/${file.filename}`);
    
    // تحديث التقرير بمسارات الصور
    report.images = [...(report.images || []), ...imagePaths];
    await report.save();
    
    return res.status(200).json({
      success: true,
      message: 'تم رفع الصور بنجاح',
      data: {
        images: report.images
      }
    });
  } catch (error) {
    console.error('خطأ في رفع الصور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصور'
    });
  }
};