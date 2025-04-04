"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
/**
 * خدمة معالجة الصور
 */
class ImageService {
    /**
     * معالجة وتحسين الصورة المرفوعة
     * @param file - ملف الصورة
     * @param directory - المجلد المستهدف
     * @returns مسار الصورة المحسنة
     */
    static async optimizeImage(file, directory = 'uploads') {
        try {
            const uploadDir = path_1.default.join(__dirname, `../../${directory}`);
            // إنشاء المجلد إذا لم يكن موجودًا
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            // إنشاء اسم ملف فريد
            const filename = `${Date.now()}-${(0, uuid_1.v4)()}.webp`;
            const outputPath = path_1.default.join(uploadDir, filename);
            // تحسين الصورة وتحويلها إلى WebP
            await (0, sharp_1.default)(file.path)
                .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: 80 })
                .toFile(outputPath);
            // حذف الملف الأصلي إذا وُجد
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            // إرجاع المسار النسبي للصورة
            return `${directory}/${filename}`;
        }
        catch (error) {
            console.error('خطأ في معالجة الصورة:', error);
            // إذا حدث خطأ، نعيد المسار الأصلي
            return file.path;
        }
    }
    /**
     * التحقق من أن الملف هو صورة صالحة
     * @param file - ملف للفحص
     * @returns ما إذا كان الملف صورة صالحة
     */
    static async validateImage(file) {
        try {
            // فحص نوع MIME
            if (!file.mimetype.startsWith('image/')) {
                return false;
            }
            // فحص محتوى الصورة باستخدام sharp
            await (0, sharp_1.default)(file.path).metadata();
            return true;
        }
        catch (error) {
            console.error('خطأ في التحقق من الصورة:', error);
            return false;
        }
    }
}
exports.ImageService = ImageService;
exports.default = ImageService;
//# sourceMappingURL=imageService.js.map