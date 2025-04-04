"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = exports.upload = exports.uploadProfileImage = exports.uploadAdvertisementImages = exports.createUploadMiddleware = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
/**
 * إنشاء خدمة رفع الملفات حسب نوع الملف والمجلد
 * @param folder المجلد المستهدف
 * @param fileTypes أنواع الملفات المسموح بها
 * @param maxFileSize الحد الأقصى لحجم الملف (بالبايت)
 * @returns وسيط رفع الملفات
 */
const createUploadMiddleware = (folder = 'advertisements', fileTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxFileSize = 5 * 1024 * 1024) => {
    // تكوين multer لتحميل الملفات
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path_1.default.join(__dirname, `../../../uploads/${folder}`);
            // إنشاء المجلد إذا لم يكن موجودًا
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueFileName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
            cb(null, uniqueFileName);
        }
    });
    // فلتر الملفات للسماح فقط بالأنواع المحددة
    const fileFilter = (req, file, cb) => {
        if (fileTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`يرجى تحميل ملفات من الأنواع المسموح بها: ${fileTypes.join(', ')}`));
        }
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: {
            fileSize: maxFileSize
        }
    });
};
exports.createUploadMiddleware = createUploadMiddleware;
// محددات مسبقة الإعداد
exports.uploadAdvertisementImages = (0, exports.createUploadMiddleware)('advertisements').array('images', 5);
exports.uploadProfileImage = (0, exports.createUploadMiddleware)('profiles', ['image/jpeg', 'image/png', 'image/jpg'], 5 * 1024 * 1024).single('image');
// تكوين multer لتحميل الصور
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads/advertisements');
        // إنشاء المجلد إذا لم يكن موجودًا
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueFileName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});
// فلتر الملفات للسماح فقط بالصور
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('يرجى تحميل صور فقط'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 ميجابايت كحد أقصى
    }
});
// وظيفة لرفع مجموعة من الصور
const uploadImages = async (files) => {
    const uploadedPaths = [];
    for (const file of files) {
        const filePath = `/uploads/advertisements/${file.filename}`;
        uploadedPaths.push(filePath);
    }
    return uploadedPaths;
};
exports.uploadImages = uploadImages;
exports.default = {
    createUploadMiddleware: exports.createUploadMiddleware,
    uploadAdvertisementImages: exports.uploadAdvertisementImages,
    uploadProfileImage: exports.uploadProfileImage,
    upload: exports.upload,
    uploadImages: exports.uploadImages
};
//# sourceMappingURL=fileUploadService.js.map