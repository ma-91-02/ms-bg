/**
 * أقسام لوحة التحكم.
 *
 * كانت الأقسام حالةً محليّة في `Dashboard` لا أثر لها في المسار: كل
 * الأقسام تعيش على `/admin/dashboard`. النتيجة أن زر رجوع المتصفّح
 * يخرج من اللوحة كلّها بدل العودة للقسم السابق، وتحديث الصفحة يعيد
 * المشرف إلى الرئيسية، ولا يمكن مشاركة رابط لقسم بعينه.
 *
 * القائمة هنا هي المصدر الوحيد: منها يُبنى المسار ويُبنى الشريط
 * الجانبي، فلا ينحرف أحدهما عن الآخر.
 */

export interface SectionDef {
  /** الجزء الظاهر في المسار: /admin/dashboard/<slug> */
  slug: string;
  label: string;
  /** صنف أيقونة Font Awesome */
  icon: string;
}

export const SECTIONS: SectionDef[] = [
  { slug: 'home', label: 'الصفحة الرئيسية', icon: 'fa-home' },
  { slug: 'users', label: 'المستخدمون', icon: 'fa-users' },
  { slug: 'advertisements', label: 'جميع الإعلانات', icon: 'fa-ad' },
  { slug: 'matches-system', label: 'نظام المطابقات', icon: 'fa-exchange-alt' },
  { slug: 'review', label: 'الإعلانات للمراجعة', icon: 'fa-clipboard-check' },
  { slug: 'contacts', label: 'طلبات التواصل', icon: 'fa-envelope' },
];

export const DEFAULT_SECTION = 'home';

/** يمنع مسارًا مكتوبًا يدويًا من عرض شاشة فارغة */
export const isKnownSection = (slug?: string): boolean =>
  !!slug && SECTIONS.some((s) => s.slug === slug);

export const sectionPath = (slug: string): string =>
  slug === DEFAULT_SECTION ? '/admin/dashboard' : `/admin/dashboard/${slug}`;

export const sectionLabel = (slug: string): string =>
  SECTIONS.find((s) => s.slug === slug)?.label ?? '';
