/**
 * تسميات عربية لقيم التعدادات.
 *
 * الواجهات تترجم التعدادات عندها (لوحة التحكم عبر `translationUtils`،
 * والتطبيق عبر i18next). لكن بعض النصوص يبنيها الخادم جملةً كاملة —
 * رسائل سجلّ النشاط مثلًا — فتُغرَس فيها القيمة الخام في منتصف جملة
 * عربية: «إعلان مفقود من نوع national_id». لا تستطيع أي واجهة إصلاح
 * ذلك لأن القيمة ليست حقلًا مستقلًا تُترجمه، بل جزء من نصّ جاهز.
 *
 * ما يبنيه الخادم يترجمه الخادم.
 */

/** يطابق `AdvertisementCategory` في مخطط Prisma */
const CATEGORY_AR: Record<string, string> = {
  passport: 'جواز سفر',
  national_id: 'بطاقة وطنية',
  driving_license: 'إجازة سوق',
  other: 'أخرى',
};

/** يطابق `AdvertisementType` في مخطط Prisma */
const TYPE_AR: Record<string, string> = {
  lost: 'مفقود',
  found: 'موجود',
};

/** القيمة غير المعروفة تُعاد كما هي بدل إخفائها خلف «غير محدد» */
export const categoryLabel = (value: string): string => CATEGORY_AR[value] ?? value;

export const typeLabel = (value: string): string => TYPE_AR[value] ?? value;
