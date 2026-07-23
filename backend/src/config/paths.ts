import path from 'path';
import fs from 'fs';

/**
 * مسارات الملفات المرفوعة — مصدر واحد.
 *
 * كانت محسوبة في ثلاثة مواضع بثلاث طرق مختلفة نسبةً إلى `__dirname`،
 * وبأعماق متباينة فتشير إلى مجلدات مختلفة فعليًا:
 *   uploadMiddleware  → dist/uploads
 *   fileUploadService → /app/uploads
 *   fileUpload        → مجلد التشغيل الحالي
 * أي أن الرفع يكتب في مكان والتقديم يقرأ من آخر.
 *
 * الحساب نسبةً إلى `__dirname` هش أصلًا لأنه يتغيّر بين التشغيل من
 * `src/` عبر ts-node والتشغيل من `dist/` بعد البناء. المسار الآن مطلق
 * ومشتقّ من جذر المشروع، ويمكن تجاوزه بمتغير بيئة عند ربط وحدة تخزين.
 */

/** جذر المشروع: مستوى واحد فوق `src` أو `dist` */
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(PROJECT_ROOT, 'uploads');

/** مسار مجلد فرعي داخل الرفع (مثل advertisements أو profiles) */
export const uploadsSubdir = (folder: string): string => path.join(UPLOADS_ROOT, folder);

/** ينشئ المجلد إن لم يكن موجودًا ويعيد مساره */
export const ensureUploadDir = (folder?: string): string => {
  const target = folder ? uploadsSubdir(folder) : UPLOADS_ROOT;
  fs.mkdirSync(target, { recursive: true });
  return target;
};

export default { UPLOADS_ROOT, uploadsSubdir, ensureUploadDir };
