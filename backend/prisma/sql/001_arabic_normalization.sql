-- ============================================================================
--  تطبيع النص العربي + فهارس trigram
--
--  يُطبَّق بعد أول ترحيل:  npm run db:sql
--
--  السبب: المطابقة السابقة كانت تقارن الأسماء حرفيًا في JavaScript، فتفشل
--  أمام فروق شائعة جدًا في الأسماء العراقية:
--    «أحمد» ≠ «احمد»   (همزة القطع)
--    «فاطمة» ≠ «فاطمه»  (تاء مربوطة)
--    «يحيى» ≠ «يحيي»    (ألف مقصورة)
--    «مُحَمَّد» ≠ «محمد»   (تشكيل)
--  هذه الدالة توحّدها كلها قبل المقارنة.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION normalize_ar(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT btrim(regexp_replace(
    translate(
      -- إزالة التشكيل والتطويل: الفتحة..السكون + الشدة + التطويل
      regexp_replace(lower(input), '[ً-ْـٰ]', '', 'g'),
      -- توحيد صور الألف والتاء المربوطة والألف المقصورة والهمزات
      'أإآٱةىؤئ',
      'ااااهيوي'
    ),
    '\s+', ' ', 'g'
  ));
$$;

COMMENT ON FUNCTION normalize_ar(text) IS
  'توحيد الأسماء العربية قبل مقارنة التشابه: إزالة التشكيل وتوحيد الألف/التاء المربوطة/الألف المقصورة';

-- فهرس تعبيري على الاسم المُطبَّع — هذا ما يجعل similarity() تستخدم الفهرس
CREATE INDEX IF NOT EXISTS idx_ad_owner_name_normalized_trgm
  ON advertisements
  USING gin (normalize_ar(owner_name) gin_trgm_ops)
  WHERE owner_name IS NOT NULL;

-- رقم المستند بلا مسافات — للمقارنة المرنة
CREATE INDEX IF NOT EXISTS idx_ad_item_number_clean
  ON advertisements (replace(item_number, ' ', ''))
  WHERE item_number IS NOT NULL;

-- عتبة التشابه الافتراضية لمعامل % (نستخدم similarity() صراحةً لكن هذا يفيد الفلترة)
-- SET pg_trgm.similarity_threshold = 0.3;
