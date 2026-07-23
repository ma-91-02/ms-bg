import multer from 'multer';
import path from 'path';
import { ensureUploadDir } from '../../config/paths';

/**
 * المسار كان `path.join(__dirname, '../../uploads')` أي `dist/uploads`
 * بعد البناء — مجلد يملكه root فيفشل إنشاؤه حين يعمل الخادم بمستخدم
 * غير جذري، ولا يطابق وحدة التخزين المربوطة على `/app/uploads`.
 */
const uploadPath = ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// فلتر الملفات (قبول الصور فقط)
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يجب أن يكون الملف صورة'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
  },
  fileFilter,
});

export default uploadMiddleware;
