import { Request, Response } from 'express';
import Document from '../../models/mobile/Document';
import DocumentImage from '../../models/mobile/DocumentImage';
import { sendSuccess, sendError } from '../../utils/responseGenerator';
import { findPotentialMatches } from '../../services/matchingService';
import { addPointsToUser, RewardType } from '../../services/rewardService';
import { createNotification, NotificationType } from '../../services/notificationService';
import { AuthRequest } from '../../middleware/authMiddleware';

// إنشاء إعلان مستمسك جديد
export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type, // lost/found
      documentType,
      ownerName,
      governorate,
      description,
      contactPhone
    } = req.body;
    
    // التحقق من وجود معلومات المستخدم
    if (!req.user) {
      return sendError(res, 'غير مصرح به - يرجى تسجيل الدخول', 401);
    }
    
    // إنشاء إعلان جديد مع حالة 'pending' (قيد الانتظار)
    const newDocument = await Document.create({
      userId: req.user.id,
      type,
      documentType,
      ownerName,
      governorate,
      description,
      contactPhone,
      status: 'pending',
      views: 0
    });
    
    // إضافة نقاط للمستخدم
    await addPointsToUser(req.user._id.toString(), RewardType.CREATE_DOCUMENT, newDocument._id.toString());

    // البحث عن مطابقات محتملة
    const potentialMatches = await findPotentialMatches(newDocument._id.toString());

    return sendSuccess(res, { document: newDocument, potentialMatches: potentialMatches.length > 0 ? potentialMatches : null }, 'تم إنشاء الإعلان بنجاح وسيتم مراجعته');
  } catch (error) {
    console.error('خطأ في إنشاء إعلان:', error);
    return sendError(res, 'حدث خطأ أثناء إنشاء الإعلان', 500);
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

// رفع صور للمستمسك
export const uploadDocumentImages = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    // التحقق من معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    // التحقق من وجود المستمسك
    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستمسك غير موجود أو ليس لديك صلاحية الوصول إليه'
      });
    }

    // التحقق من وجود ملفات تم رفعها
    if (!req.files || Array.isArray(req.files) && req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تقديم أي صور'
      });
    }

    // الحصول على مسارات الملفات المرفوعة
    const files = Array.isArray(req.files) ? req.files : [req.files];
    const savedImages = [];

    // حفظ معلومات الصور في قاعدة البيانات
    for (const file of files) {
      const newImage = await DocumentImage.create({
        documentId: document._id,
        imageUrl: `/uploads/${file.filename}`
      });
      savedImages.push(newImage);
    }

    res.status(200).json({
      success: true,
      message: 'تم رفع الصور بنجاح',
      images: savedImages
    });
  } catch (error) {
    console.error('خطأ في رفع صور المستمسك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفع الصور'
    });
  }
};

// الحصول على مستمسكات المستخدم
export const getUserDocuments = async (req: AuthRequest, res: Response) => {
  try {
    // التحقق من معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // بناء الاستعلام
    const query: any = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // جلب المستمسكات والعدد الإجمالي
    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // جلب الصور لكل مستمسك
    const documentsWithImages = await Promise.all(
      documents.map(async (doc) => {
        const images = await DocumentImage.find({ documentId: doc._id });
        return {
          ...doc.toObject(),
          images: images.map(img => img.imageUrl)
        };
      })
    );

    res.status(200).json({
      success: true,
      documents: documentsWithImages,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('خطأ في جلب مستمسكات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستمسكات'
    });
  }
};

// البحث عن المستمسكات
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { type, governorate, documentType, keyword } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // بناء الاستعلام
    const query: any = { status: 'approved' };
    
    if (type) query.type = type;
    if (governorate) query.governorate = governorate;
    if (documentType) query.documentType = documentType;
    
    if (keyword) {
      query.$or = [
        { ownerName: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // جلب المستمسكات والعدد الإجمالي
    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // جلب الصور لكل مستمسك
    const documentsWithImages = await Promise.all(
      documents.map(async (doc) => {
        const images = await DocumentImage.find({ documentId: doc._id });
        return {
          ...doc.toObject(),
          images: images.map(img => img.imageUrl)
        };
      })
    );

    res.status(200).json({
      success: true,
      documents: documentsWithImages,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('خطأ في البحث عن المستمسكات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن المستمسكات'
    });
  }
};

// الحصول على تفاصيل مستمسك
export const getDocumentDetails = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    // جلب المستمسك
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستمسك غير موجود'
      });
    }

    // التحقق من حالة المستمسك
    if (document.status !== 'approved') {
      // يمكن للمسؤولين والمالك فقط الوصول إلى المستمسكات غير المعتمدة
      if (!req.user || (req.user._id.toString() !== document.userId.toString() && !req.user.isAdmin)) {
        return res.status(403).json({
          success: false,
          message: 'لا يمكنك الوصول إلى هذا المستمسك'
        });
      }
    }

    // جلب الصور
    const images = await DocumentImage.find({ documentId });

    // زيادة عدد المشاهدات
    await Document.findByIdAndUpdate(documentId, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      document: {
        ...document.toObject(),
        images: images.map(img => img.imageUrl)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب تفاصيل المستمسك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل المستمسك'
    });
  }
};

// تحديث مستمسك
export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const updateData = req.body;

    // التحقق من معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    // التحقق من وجود المستمسك
    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستمسك غير موجود أو ليس لديك صلاحية تحديثه'
      });
    }

    // لا يمكن تحديث المستمسكات التي تم قبولها أو رفضها
    if (document.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تحديث المستمسك بعد المراجعة'
      });
    }

    // تحديث المستمسك
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'تم تحديث المستمسك بنجاح',
      document: updatedDocument
    });
  } catch (error) {
    console.error('خطأ في تحديث المستمسك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المستمسك'
    });
  }
};

// حذف مستمسك
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    // التحقق من معلومات المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }

    // التحقق من وجود المستمسك
    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستمسك غير موجود أو ليس لديك صلاحية حذفه'
      });
    }

    // حذف صور المستمسك
    await DocumentImage.deleteMany({ documentId });

    // حذف المستمسك
    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      success: true,
      message: 'تم حذف المستمسك وصوره بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المستمسك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المستمسك'
    });
  }
};