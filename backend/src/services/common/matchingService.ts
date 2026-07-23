import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AdvertisementType } from '../../models/mobile/Advertisement';
import { MatchStatus } from '../../models/mobile/AdvertisementMatch';

/**
 * محرك مطابقة الإعلانات.
 *
 * ما تغيّر عن نسخة Mongo — والسبب:
 *
 *  1. كانت تجلب كل المرشحين ثم تقارنهم نصيًا في JavaScript، وتنفّذ استعلامًا
 *     منفصلًا لكل مرشّح للتأكد من عدم وجود مطابقة سابقة (N+1). صارت الفلترة
 *     والتشابه النصي داخل Postgres في استعلام واحد يستخدم فهارس trigram.
 *
 *  2. مقارنة الأسماء كانت حرفية فتفشل أمام «أحمد/احمد» و«فاطمة/فاطمه».
 *     صارت تمر عبر `normalize_ar()` ثم `similarity()`.
 *
 *  3. حماية التكرار كانت باستعلام مسبق لكل زوج ثم مسار إداري للتنظيف؛
 *     صارت قيد `@@unique` في المخطط + `skipDuplicates`.
 *
 * أوزان النقاط لم تتغيّر إطلاقًا — نفس القواعد ونفس العتبات، حتى تبقى
 * نتائج المطابقة قابلة للمقارنة مع ما أنتجه النظام سابقًا.
 */

/** أوزان حساب درجة التطابق — منقولة كما هي من النسخة السابقة */
const WEIGHTS = {
  GOVERNORATE: 10,
  ITEM_NUMBER: 60,
  OWNER_NAME: 30,
  DESCRIPTION_STRONG: 10,
  DESCRIPTION_PARTIAL: 5,
} as const;

/** عتبات القبول — منقولة كما هي */
const THRESHOLDS = {
  MIN_TOTAL_SCORE: 15,
  NAME_STRONG: 0.8,
  NAME_MIN: 0.3,
  DESCRIPTION_STRONG: 0.5,
  DESCRIPTION_PARTIAL: 0.3,
} as const;

/** صف مرشّح كما يعيده استعلام المطابقة */
interface CandidateRow {
  id: string;
  governorate_match: boolean;
  item_number_match: boolean;
  name_similarity: number | null;
  description_similarity: number | null;
}

/**
 * يعثر على المرشحين ويحسب درجات التشابه داخل قاعدة البيانات.
 *
 * المرشّح يُقبل مبدئيًا إذا تطابق رقم المستند، أو بلغ تشابه الاسم الحد
 * الأدنى، أو تطابقت المحافظة — أي أن الترشيح المبدئي واسع عمدًا،
 * والترجيح النهائي يبقى في TypeScript ليظل مقروءًا وقابلًا للاختبار.
 */
const fetchScoredCandidates = (ad: {
  id: string;
  type: string;
  category: string;
  governorate: string;
  ownerName: string | null;
  itemNumber: string | null;
  description: string;
}): Promise<CandidateRow[]> => {
  const searchType =
    ad.type === AdvertisementType.LOST ? AdvertisementType.FOUND : AdvertisementType.LOST;

  return prisma.$queryRaw<CandidateRow[]>`
    SELECT
      c.id,
      (c.governorate = ${ad.governorate}::"Governorate") AS governorate_match,
      (
        ${ad.itemNumber}::text IS NOT NULL
        AND c.item_number IS NOT NULL
        AND (
          replace(c.item_number, ' ', '') = replace(${ad.itemNumber}::text, ' ', '')
          OR replace(c.item_number, ' ', '') LIKE '%' || replace(${ad.itemNumber}::text, ' ', '') || '%'
          OR replace(${ad.itemNumber}::text, ' ', '') LIKE '%' || replace(c.item_number, ' ', '') || '%'
        )
      ) AS item_number_match,
      CASE
        WHEN ${ad.ownerName}::text IS NULL OR c.owner_name IS NULL THEN NULL
        ELSE similarity(normalize_ar(c.owner_name), normalize_ar(${ad.ownerName}::text))
      END AS name_similarity,
      similarity(normalize_ar(c.description), normalize_ar(${ad.description})) AS description_similarity
    FROM advertisements c
    WHERE c.id <> ${ad.id}
      AND c.type = ${searchType}::"AdvertisementType"
      AND c.category = ${ad.category}::"ItemCategory"
      AND c.is_approved = true
      AND c.is_resolved = false
      -- استبعاد الأزواج المسجَّلة مسبقًا في اتجاهيها
      AND NOT EXISTS (
        SELECT 1 FROM advertisement_matches m
        WHERE (m.lost_advertisement_id = c.id AND m.found_advertisement_id = ${ad.id})
           OR (m.lost_advertisement_id = ${ad.id} AND m.found_advertisement_id = c.id)
      )
    ORDER BY
      COALESCE(similarity(normalize_ar(c.owner_name), normalize_ar(COALESCE(${ad.ownerName}::text, ''))), 0) DESC
    LIMIT 200
  `;
};

/** يحسب الدرجة النهائية والحقول المتطابقة — نفس منطق النسخة السابقة */
const scoreCandidate = (row: CandidateRow): { score: number; fields: string[] } => {
  const fields: string[] = [];
  let score = 0;

  if (row.governorate_match) {
    fields.push('governorate');
    score += WEIGHTS.GOVERNORATE;
  }

  if (row.item_number_match) {
    fields.push('itemNumber');
    score += WEIGHTS.ITEM_NUMBER;
  }

  const nameSim = row.name_similarity ?? 0;
  if (nameSim >= THRESHOLDS.NAME_STRONG) {
    fields.push('ownerName');
    score += WEIGHTS.OWNER_NAME;
  } else if (nameSim >= THRESHOLDS.NAME_MIN) {
    fields.push('ownerName_partial');
    score += Math.round(WEIGHTS.OWNER_NAME * nameSim);
  }

  const descSim = row.description_similarity ?? 0;
  if (descSim > THRESHOLDS.DESCRIPTION_STRONG) {
    fields.push('description');
    score += WEIGHTS.DESCRIPTION_STRONG;
  } else if (descSim > THRESHOLDS.DESCRIPTION_PARTIAL) {
    fields.push('description_partial');
    score += WEIGHTS.DESCRIPTION_PARTIAL;
  }

  return { score: Math.min(score, 100), fields };
};

/**
 * البحث عن مطابقات محتملة لإعلان وحفظها.
 * يعيد عدد المطابقات الجديدة المُنشأة.
 */
export const findPotentialMatches = async (advertisementId: string): Promise<number> => {
  try {
    const advertisement = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
      select: {
        id: true,
        type: true,
        category: true,
        governorate: true,
        ownerName: true,
        itemNumber: true,
        description: true,
        isApproved: true,
      },
    });

    if (!advertisement) {
      console.error(`❌ الإعلان غير موجود: ${advertisementId}`);
      return 0;
    }

    if (!advertisement.isApproved) {
      console.log(`⚠️ تخطي الإعلان غير المعتمد: ${advertisementId}`);
      return 0;
    }

    const candidates = await fetchScoredCandidates(advertisement);
    console.log(`✅ ${candidates.length} مرشح محتمل للإعلان ${advertisementId}`);

    const isLost = advertisement.type === AdvertisementType.LOST;

    const newMatches = candidates
      .map((row) => ({ row, ...scoreCandidate(row) }))
      .filter(
        ({ score, fields }) =>
          score >= THRESHOLDS.MIN_TOTAL_SCORE ||
          fields.includes('itemNumber') ||
          fields.includes('ownerName')
      )
      .map(({ row, score, fields }) => ({
        lostAdvertisementId: isLost ? advertisement.id : row.id,
        foundAdvertisementId: isLost ? row.id : advertisement.id,
        matchScore: score,
        matchingFields: fields,
        status: MatchStatus.PENDING,
        notificationSent: false,
      }));

    if (newMatches.length === 0) {
      console.log(`😞 لا مطابقات جديدة للإعلان ${advertisementId}`);
      return 0;
    }

    // skipDuplicates يعتمد على قيد @@unique — لا حاجة لفحص مسبق لكل زوج
    const result = await prisma.advertisementMatch.createMany({
      data: newMatches,
      skipDuplicates: true,
    });

    console.log(`✨ حُفظت ${result.count} مطابقة جديدة للإعلان ${advertisementId}`);
    return result.count;
  } catch (error) {
    console.error('❌ خطأ في البحث عن تطابقات محتملة:', error);
    return 0;
  }
};

/**
 * تشغيل المطابقة عقب إنشاء أو اعتماد إعلان.
 *
 * النسخة السابقة كانت تؤخّر التنفيذ ثانية كاملة عبر setTimeout «لضمان حفظ
 * الإعلان». هذا لم يعد لازمًا: كتابة Prisma تُنتظر فعليًا قبل الاستدعاء،
 * فالإعلان موجود ومُثبَّت في قاعدة البيانات حين تبدأ المطابقة.
 */
export const checkForMatches = (advertisementId: string): void => {
  void findPotentialMatches(advertisementId).catch((err) => {
    console.error('خطأ في جدولة البحث عن تطابقات:', err);
  });
};

/** تشغيل المطابقة على كل الإعلانات المعتمدة غير المحلولة — يستخدمه مسار الإدارة */
export const runMatchingForAll = async (): Promise<number> => {
  const ads = await prisma.advertisement.findMany({
    where: { isApproved: true, isResolved: false },
    select: { id: true },
  });

  let total = 0;
  for (const ad of ads) {
    total += await findPotentialMatches(ad.id);
  }

  console.log(`✨ إجمالي المطابقات الجديدة: ${total} من ${ads.length} إعلان`);
  return total;
};

export default { findPotentialMatches, checkForMatches, runMatchingForAll };
