import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

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
      const uploadDir = path.join(__dirname, `../../../uploads/${folder}`);
      
      // إنشاء المجلد إذا لم يكن موجودًا
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
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
export const uploadProfileImage = createUploadMiddleware('profiles', ['image/jpeg', 'image/png', 'image/jpg'], 2 * 1024 * 1024).single('image');

// تكوين multer لتحميل الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/advertisements');
    
    // إنشاء المجلد إذا لم يكن موجودًا
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
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

// وظيفة لرفع مجموعة من الصور
export const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
  const uploadedPaths: string[] = [];
  
  for (const file of files) {
    const filePath = `/uploads/advertisements/${file.filename}`;
    uploadedPaths.push(filePath);
  }
  
  return uploadedPaths;
};

export default {
  createUploadMiddleware,
  uploadAdvertisementImages,
  uploadProfileImage,
  upload,
  uploadImages
}; 