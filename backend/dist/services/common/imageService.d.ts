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
export declare class ImageService {
    /**
     * معالجة وتحسين الصورة المرفوعة
     * @param file - ملف الصورة
     * @param directory - المجلد المستهدف
     * @returns مسار الصورة المحسنة
     */
    static optimizeImage(file: UploadedFile, directory?: string): Promise<string>;
    /**
     * التحقق من أن الملف هو صورة صالحة
     * @param file - ملف للفحص
     * @returns ما إذا كان الملف صورة صالحة
     */
    static validateImage(file: UploadedFile): Promise<boolean>;
}
export default ImageService;
//# sourceMappingURL=imageService.d.ts.map