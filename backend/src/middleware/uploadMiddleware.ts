import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// إنشاء مجلد التحميل إذا لم يكن موجودًا
const createUploadDir = (dir: string): void => {
  const uploadDir = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// إعداد تخزين Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = 'uploads/reports';
    createUploadDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // استخدام UUID لإنشاء اسم فريد للملف
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// فلتر للتحقق من نوع الملف
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // قبول صور فقط (jpg, jpeg, png)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى تحميل صور فقط.'));
  }
};

// إنشاء وسيط التحميل لصور التقارير
export const uploadReportImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
    files: 5 // 5 ملفات كحد أقصى
  }
}).array('images', 5);

// إنشاء وسيط التحميل لصور الملف الشخصي
export const uploadProfileImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = 'uploads/profiles';
      createUploadDir(folder);
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    }
  }),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 ميجابايت كحد أقصى
  }
}).single('profileImage');

export default {
  uploadReportImages,
  uploadProfileImage
}; 