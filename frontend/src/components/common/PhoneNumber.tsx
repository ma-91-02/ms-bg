import React from 'react';

/**
 * عرض رقم هاتف داخل صفحة عربية.
 *
 * الصفحة كلّها `dir="rtl"`، وخوارزمية الاتجاه ثنائي الاتجاه في
 * يونيكود تُصنّف `+` رمزًا محايدًا: فتضعه في نهاية السلسلة بدل
 * بدايتها، ويظهر `+9647701234567` للمشرف على هيئة `9647701234567+`.
 * الرقم نفسه سليم في التخزين — العطب في العرض وحده، وهو ما يجعله
 * سهل التجاهل ومربكًا للمشرف الذي ينسخ الرقم ليتصل به.
 *
 * `dir="ltr"` على العنصر الحاوي وحده يعزل الرقم عن اتجاه الصفحة.
 */

interface Props {
  value?: string | null;
  /** ما يُعرض حين لا يوجد رقم */
  fallback?: string;
  className?: string;
}

const PhoneNumber: React.FC<Props> = ({ value, fallback = 'بدون رقم هاتف', className }) => {
  if (!value) return <span className={className}>{fallback}</span>;

  return (
    <span className={className} dir="ltr" style={{ unicodeBidi: 'isolate' }}>
      {value}
    </span>
  );
};

export default PhoneNumber;
