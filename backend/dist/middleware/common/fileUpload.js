"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAdvertisementImages = exports.uploadProfileImage = exports.createUploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// إنشاء مجلد التحميل إذا لم يكن موجودًا
const createUploadDir = (dir) => {
    const uploadDir = path_1.default.join(__dirname, '../../../', dir);
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
};
// إنشاء وسيط الرفع العام
const createUploadMiddleware = (options) => {
    const { folder, fieldName, maxSize = 5 * 1024 * 1024, // 5 ميجابايت افتراضياً
    maxFiles = 1, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], } = options;
    createUploadDir(`uploads/${folder}`);
    // إعداد تخزين Multer
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, `uploads/${folder}`);
        },
        filename: (_req, file, cb) => {
            // استخدام UUID لإنشاء اسم فريد للملف
            const uniqueFilename = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
            cb(null, uniqueFilename);
        }
    });
    // فلتر للتحقق من نوع الملف
    const fileFilter = (_req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('نوع الملف غير مدعوم. الأنواع المسموح بها: ' + allowedTypes.join(', ')));
        }
    };
    // إنشاء وسيط التحميل
    return maxFiles === 1
        ? (0, multer_1.default)({
            storage,
            fileFilter,
            limits: { fileSize: maxSize }
        }).single(fieldName)
        : (0, multer_1.default)({
            storage,
            fileFilter,
            limits: { fileSize: maxSize, files: maxFiles }
        }).array(fieldName, maxFiles);
};
exports.createUploadMiddleware = createUploadMiddleware;
// وسائط جاهزة للاستخدام الشائع
exports.uploadProfileImage = (0, exports.createUploadMiddleware)({
    folder: 'profiles',
    fieldName: 'image',
    maxSize: 2 * 1024 * 1024, // 2 ميجابايت
});
exports.uploadAdvertisementImages = (0, exports.createUploadMiddleware)({
    folder: 'advertisements',
    fieldName: 'images',
    maxSize: 5 * 1024 * 1024, // 5 ميجابايت
    maxFiles: 5
});
exports.default = {
    createUploadMiddleware: exports.createUploadMiddleware,
    uploadProfileImage: exports.uploadProfileImage,
    uploadAdvertisementImages: exports.uploadAdvertisementImages
};
//# sourceMappingURL=fileUpload.js.map