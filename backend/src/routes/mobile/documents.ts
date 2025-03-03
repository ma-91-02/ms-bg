import { Router } from 'express';
import { protectMobile } from '../../middleware/mobileAuthMiddleware';
import { otpLimiter } from '../../middleware/rateLimiter';
import * as documentController from '../../controllers/mobile/documentController';
import { upload } from '../../middleware/fileUpload';

const router = Router();

// مسارات محمية (تتطلب مصادقة)
router.use(protectMobile);

// إنشاء إعلان مستمسك جديد
router.post('/', documentController.createDocument);

// جلب مستمسكات المستخدم
router.get('/my-documents', documentController.getUserDocuments);

// البحث عن مستمسكات
router.get('/search', documentController.searchDocuments);

// رفع الصور للمستمسك
router.post('/:documentId/images', upload.array('images', 5), documentController.uploadDocumentImages);

// تفاصيل مستمسك معين
router.get('/:documentId', documentController.getDocumentDetails);

// تحديث مستمسك
router.patch('/:documentId', documentController.updateDocument);

// حذف مستمسك
router.delete('/:documentId', documentController.deleteDocument);

export default router; 