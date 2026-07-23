import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { ensureUploadDir, UPLOADS_ROOT } from '../../config/paths';

/**
 * إنشاء خدمة رفع الملفات حسب نوع الملف والمجلد
 * @param folder المجلد المستهدف
 * @param fileTypes أنواع الملفات المسموح بها
 * @param maxFileSize الحد الأقصى لحجم الملف (بالبايت)
 * @returns وسيط رفع الملفات
 */
export const createUploadMiddleware = (
  folder: string = 'advertisements',
  fileTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg'],
  maxFileSize: number = 5 * 1024 * 1024
) => {
  // تكوين multer لتحميل الملفات
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // مصدر واحد للمسار — كان محسوبًا نسبةً إلى __dirname بعمق مختلف
      // عن بقية المواضع فتتباعد مجلدات الكتابة والقراءة
      cb(null, ensureUploadDir(folder));
    },
    filename: (req, file, cb) => {
      const uniqueFileName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueFileName);
    }
  });

  // فلتر الملفات للسماح فقط بالأنواع المحددة
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`يرجى تحميل ملفات من الأنواع المسموح بها: ${fileTypes.join(', ')}`));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize
    }
  });
};

// محددات مسبقة الإعداد
export const uploadAdvertisementImages = createUploadMiddleware('advertisements').array('images', 5);
export const uploadProfileImage = createUploadMiddleware('profiles', ['image/jpeg', 'image/png', 'image/jpg'], 5 * 1024 * 1024).single('image');

// تكوين multer لتحميل الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir('advertisements'));
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// فلتر الملفات للسماح فقط بالصور
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يرجى تحميل صور فقط'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
  }
});

/**
 * المسار العام للملفات المرفوعة.
 *
 * علّة أُصلحت هنا: كانت الدالة تبني المسار من نصّ ثابت
 * `/uploads/advertisements/${filename}` بغضّ النظر عن الموضع الحقيقي
 * للملف. والوسيط المستخدم في مسار الإعلانات (`uploadMiddleware`) يحفظ
 * في جذر مجلد الرفع لا في مجلد فرعي — فيُخزَّن الملف في
 * `/app/uploads/x.jpg` بينما يُسجَّل في قاعدة البيانات كـ
 * `/uploads/advertisements/x.jpg`. النتيجة: الرفع ينجح والصورة تُعيد
 * 404 عند العرض، وهو فشل صامت لا يظهر إلا حين يفتح المستخدم الإعلان.
 *
 * المسار الآن مشتقّ من `file.destination` الذي يضبطه الوسيط فعليًا.
 */
export const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> =>
  files.map((file) => {
    // الجزء النسبي من جذر مجلد الرفع (قد يكون فارغًا أو 'advertisements')
    const subdir = path.relative(UPLOADS_ROOT, file.destination);
    const segments = ['uploads', ...subdir.split(path.sep).filter(Boolean), file.filename];
    return `/${segments.join('/')}`;
  });

export default {
  createUploadMiddleware,
  uploadAdvertisementImages,
  uploadProfileImage,
  upload,
  uploadImages
}; 