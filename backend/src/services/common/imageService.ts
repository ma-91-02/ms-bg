import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * واجهة ملف صورة
 */
export interface UploadedFile {
  path: string;
  mimetype: string;
  filename?: string;
  size?: number;
  originalname?: string;
}

/**
 * خدمة معالجة الصور
 */
export class ImageService {
  /**
   * معالجة وتحسين الصورة المرفوعة
   * @param file - ملف الصورة
   * @param directory - المجلد المستهدف
   * @returns مسار الصورة المحسنة
   */
  static async optimizeImage(file: UploadedFile, directory: string = 'uploads'): Promise<string> {
    try {
      const uploadDir = path.join(__dirname, `../../${directory}`);
      
      // إنشاء المجلد إذا لم يكن موجودًا
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // إنشاء اسم ملف فريد
      const filename = `${Date.now()}-${uuidv4()}.webp`;
      const outputPath = path.join(uploadDir, filename);
      
      // تحسين الصورة وتحويلها إلى WebP
      await sharp(file.path)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      // حذف الملف الأصلي إذا وُجد
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      // إرجاع المسار النسبي للصورة
      return `${directory}/${filename}`;
    } catch (error) {
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
  static async validateImage(file: UploadedFile): Promise<boolean> {
    try {
      // فحص نوع MIME
      if (!file.mimetype.startsWith('image/')) {
        return false;
      }
      
      // فحص محتوى الصورة باستخدام sharp
      await sharp(file.path).metadata();
      return true;
    } catch (error) {
      console.error('خطأ في التحقق من الصورة:', error);
      return false;
    }
  }
}

export default ImageService; 