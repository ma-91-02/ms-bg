import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// التأكد من وجود مجلد التحميل
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// تكوين التخزين
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // إنشاء اسم فريد للملف مع الاحتفاظ بامتداد الملف الأصلي
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// فلتر للتحقق من أنواع الملفات
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // قبول الصور فقط
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى تحميل صور فقط.'));
  }
};

// الحصول على الحد الأقصى لحجم الملف من متغيرات البيئة أو استخدام القيمة الافتراضية
const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5 ميجابايت افتراضياً

// إعداد middleware multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize
  }
});

export default {
  upload
}; 