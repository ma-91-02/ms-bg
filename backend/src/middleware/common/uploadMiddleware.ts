import multer from 'multer';
import path from 'path';
import fs from 'fs';

// تحديد مسار تخزين الملفات
const uploadPath = path.join(__dirname, '../../uploads');

// التأكد من وجود المجلد
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// تكوين التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// فلتر الملفات (قبول الصور فقط)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يجب أن يكون الملف صورة'));
  }
};

// تكوين multer
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
  },
  fileFilter
}); 