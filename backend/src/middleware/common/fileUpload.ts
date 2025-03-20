import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// إنشاء مجلد التحميل إذا لم يكن موجودًا
const createUploadDir = (dir: string): void => {
  const uploadDir = path.join(__dirname, '../../../', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// إنشاء وسيط الرفع العام
export const createUploadMiddleware = (options: {
  folder: string;
  fieldName: string;
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
}) => {
  const {
    folder,
    fieldName,
    maxSize = 5 * 1024 * 1024, // 5 ميجابايت افتراضياً
    maxFiles = 1,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  } = options;

  createUploadDir(`uploads/${folder}`);

  // إعداد تخزين Multer
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, `uploads/${folder}`);
    },
    filename: (_req, file, cb) => {
      // استخدام UUID لإنشاء اسم فريد للملف
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  });

  // فلتر للتحقق من نوع الملف
  const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. الأنواع المسموح بها: ' + allowedTypes.join(', ')));
    }
  };

  // إنشاء وسيط التحميل
  return maxFiles === 1
    ? multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSize }
      }).single(fieldName)
    : multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSize, files: maxFiles }
      }).array(fieldName, maxFiles);
};

// وسائط جاهزة للاستخدام الشائع
export const uploadProfileImage = createUploadMiddleware({
  folder: 'profiles',
  fieldName: 'profileImage',
  maxSize: 2 * 1024 * 1024, // 2 ميجابايت
});

export const uploadAdvertisementImages = createUploadMiddleware({
  folder: 'advertisements',
  fieldName: 'images',
  maxSize: 5 * 1024 * 1024, // 5 ميجابايت
  maxFiles: 5
});

export default {
  createUploadMiddleware,
  uploadProfileImage,
  uploadAdvertisementImages
}; 