import { Request, Response } from 'express';
import ContactRequest from '../../models/mobile/ContactRequest';
import Document from '../../models/mobile/Document';
import User from '../../models/mobile/User';
import { createNotification } from '../../services/notificationService';
import { NotificationType } from '../../types/notifications';
import { AuthRequest } from '../../middleware/authMiddleware';
import { addPointsToUser, RewardType } from '../../services/rewardService';

/**
 * إنشاء طلب تواصل جديد
 */
export const createContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, message } = req.body;
    
    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير معرف المستند ورسالة'
      });
    }
    
    // التحقق من وجود المستخدم المصادق
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }
    
    // التحقق من وجود المستند
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'المستند غير موجود'
      });
    }
    
    // التحقق مما إذا كان المستخدم يحاول الاتصال بمستنده الخاص
    if (document.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك إنشاء طلب تواصل مع مستند خاص بك'
      });
    }
    
    // التحقق مما إذا كان هناك طلب موجود بالفعل
    const existingRequest = await ContactRequest.findOne({
      requesterId: req.user._id,
      documentId: documentId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'لديك بالفعل طلب تواصل نشط لهذا المستند'
      });
    }
    
    // إنشاء طلب تواصل جديد
    const contactRequest = await ContactRequest.create({
      requesterId: req.user._id,
      documentOwnerId: document.userId,
      documentId: documentId,
      message: message,
      status: 'pending'
    });
    
    // إرسال إشعار إلى مالك المستند
    await createNotification({
      userId: document.userId,
      title: 'طلب تواصل جديد',
      body: `قام شخص ما بطلب التواصل معك بخصوص المستند "${document.documentType}"`,
      type: NotificationType.CONTACT_REQUEST,
      referenceId: contactRequest._id
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء طلب التواصل بنجاح',
      data: {
        requestId: contactRequest._id,
        status: contactRequest.status,
        createdAt: contactRequest.createdAt
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء طلب تواصل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء طلب التواصل'
    });
  }
};

/**
 * الحصول على طلبات التواصل الخاصة بالمستخدم
 */
export const getUserContactRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'received', status = 'all' } = req.query;
    
    // التحقق من وجود المستخدم المصادق
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }
    
    // إعداد الاستعلام بناءً على نوع الطلبات (مرسلة أو مستلمة)
    const query: any = {};
    if (type === 'sent') {
      query.requesterId = req.user._id;
    } else if (type === 'received') {
      query.documentOwnerId = req.user._id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'نوع الطلب غير صالح. يجب أن يكون "sent" أو "received"'
      });
    }
    
    // فلترة حسب الحالة إذا تم تحديدها
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // جلب طلبات التواصل مع معلومات المستخدم والمستند
    const contactRequests = await ContactRequest.find(query)
      .populate('requesterId', 'fullName phoneNumber')
      .populate('documentOwnerId', 'fullName phoneNumber')
      .populate('documentId', 'documentType ownerName description')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contactRequests.length,
      data: contactRequests
    });
  } catch (error) {
    console.error('خطأ في جلب طلبات التواصل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب طلبات التواصل'
    });
  }
};

/**
 * الحصول على تفاصيل طلب تواصل محدد
 */
export const getContactRequestDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    
    // التحقق من وجود المستخدم المصادق
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }
    
    // جلب طلب التواصل مع معلومات المستخدم والمستند
    const contactRequest = await ContactRequest.findById(requestId)
      .populate('requesterId', 'fullName phoneNumber')
      .populate('documentOwnerId', 'fullName phoneNumber')
      .populate('documentId', 'documentType ownerName description');
    
    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود'
      });
    }
    
    // التحقق من صلاحية الوصول
    const isRequester = contactRequest.requesterId._id.toString() === req.user._id.toString();
    const isDocumentOwner = contactRequest.documentOwnerId._id.toString() === req.user._id.toString();
    
    if (!isRequester && !isDocumentOwner) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا الطلب'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contactRequest
    });
  } catch (error) {
    console.error('خطأ في جلب تفاصيل طلب التواصل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل طلب التواصل'
    });
  }
};

/**
 * الموافقة على طلب تواصل
 */
export const approveContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    
    // التحقق من وجود المستخدم المصادق
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }
    
    // جلب طلب التواصل
    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو مالك المستند
    if (contactRequest.documentOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للموافقة على هذا الطلب'
      });
    }
    
    // التحقق من أن الطلب في حالة معلقة
    if (contactRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن الموافقة على طلب تم معالجته بالفعل'
      });
    }
    
    // تحديث حالة الطلب
    contactRequest.status = 'approved';
    contactRequest.approvedAt = new Date();
    await contactRequest.save();
    
    // إضافة نقاط المكافأة للمستخدم
    await addPointsToUser(
      req.user._id.toString(),
      RewardType.CONTACT_CONFIRM,
      contactRequest._id.toString()
    );
    
    // جلب معلومات المستخدم الذي قدم الطلب لاستخدامها في الإشعار
    const requester = await User.findById(contactRequest.requesterId).select('fullName');
    if (!requester) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم مقدم الطلب غير موجود'
      });
    }
    
    // إرسال إشعار إلى مقدم الطلب
    await createNotification({
      userId: contactRequest.requesterId,
      title: 'تمت الموافقة على طلب التواصل',
      body: `تمت الموافقة على طلب التواصل الخاص بك. يمكنك الآن التواصل مع ${requester.fullName}`,
      type: NotificationType.CONTACT_APPROVED,
      referenceId: contactRequest._id
    });
    
    // جلب مستند للحصول على معلومات إضافية
    const document = await Document.findById(contactRequest.documentId);
    
    res.status(200).json({
      success: true,
      message: 'تمت الموافقة على طلب التواصل بنجاح',
      data: {
        requestId: contactRequest._id,
        status: contactRequest.status,
        requesterContact: {
          fullName: requester.fullName,
          phoneNumber: requester.phoneNumber
        },
        documentDetails: document ? {
          id: document._id,
          type: document.documentType,
          ownerName: document.ownerName
        } : null
      }
    });
  } catch (error) {
    console.error('خطأ في الموافقة على طلب التواصل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الموافقة على طلب التواصل'
    });
  }
};

/**
 * رفض طلب تواصل
 */
export const rejectContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    // التحقق من وجود المستخدم المصادق
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به'
      });
    }
    
    // جلب طلب التواصل
    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'طلب التواصل غير موجود'
      });
    }
    
    // التحقق من أن المستخدم هو مالك المستند
    if (contactRequest.documentOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لرفض هذا الطلب'
      });
    }
    
    // التحقق من أن الطلب في حالة معلقة
    if (contactRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن رفض طلب تم معالجته بالفعل'
      });
    }
    
    // تحديث حالة الطلب
    contactRequest.status = 'rejected';
    contactRequest.rejectionReason = reason || 'تم رفض الطلب من قبل المالك';
    await contactRequest.save();
    
    // إرسال إشعار إلى مقدم الطلب
    await createNotification({
      userId: contactRequest.requesterId,
      title: 'تم رفض طلب التواصل',
      body: `تم رفض طلب التواصل الخاص بك${reason ? `: ${reason}` : ''}`,
      type: NotificationType.CONTACT_REJECTED,
      referenceId: contactRequest._id
    });
    
    res.status(200).json({
      success: true,
      message: 'تم رفض طلب التواصل بنجاح',
      data: {
        requestId: contactRequest._id,
        status: contactRequest.status,
        rejectionReason: contactRequest.rejectionReason
      }
    });
  } catch (error) {
    console.error('خطأ في رفض طلب التواصل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء رفض طلب التواصل'
    });
  }
}; 