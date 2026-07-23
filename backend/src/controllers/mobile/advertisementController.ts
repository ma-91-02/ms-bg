import { Request, Response } from 'express';
import {
  Prisma,
  AdvertisementType as AdType,
  ItemCategory as Category,
  Governorate as Gov,
} from '@prisma/client';
import prisma from '../../config/prisma';
import {
  AdvertisementType,
  AdvertisementStatus,
  ItemCategory,
  Governorate,
} from '../../models/mobile/Advertisement';
import { uploadImages } from '../../services/common/fileUploadService';
import { AuthRequest } from '../../types/express';
import { checkForMatches } from '../../services/common/matchingService';

const HIDDEN_PHONE = '********* (متاح عند طلب الاتصال)';

const ownerSelect = {
  user: { select: { id: true, fullName: true, phoneNumber: true } },
} satisfies Prisma.AdvertisementInclude;

type AdWithOwner = Prisma.AdvertisementGetPayload<{ include: typeof ownerSelect }>;

const requireUser = (req: Request, res: Response): string | null => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: 'غير مصرح به. يرجى تسجيل الدخول' });
    return null;
  }
  return userId;
};

/** إخفاء أرقام التواصل عن غير صاحب الإعلان */
const hideContact = (ad: AdWithOwner, viewerId?: string): AdWithOwner => {
  if (!ad.hideContactInfo || ad.userId === viewerId) return ad;
  return {
    ...ad,
    contactPhone: HIDDEN_PHONE,
    user: { ...ad.user, phoneNumber: HIDDEN_PHONE },
  };
};

/**
 * الحقول التي يملك المستخدم كتابتها.
 *
 * علّة أمنية أُصلحت هنا: `createAdvertisement` كان ينشر `...req.body`
 * و`updateAdvertisement` يمرّر `req.body` كاملًا إلى التحديث — أي أن
 * المستخدم يستطيع إرسال `isApproved: true` أو `status: 'approved'`
 * فيعتمد إعلانه بنفسه ويتجاوز مراجعة الإدارة كليًا.
 */
const USER_WRITABLE = [
  'type',
  'category',
  'governorate',
  'ownerName',
  'itemNumber',
  'description',
  'contactPhone',
  'hideContactInfo',
] as const;

const pickWritable = (body: any): Record<string, any> => {
  const data: Record<string, any> = {};
  for (const field of USER_WRITABLE) {
    if (body?.[field] !== undefined) data[field] = body[field];
  }
  return data;
};

const buildFilters = (query: Request['query']): Prisma.AdvertisementWhereInput => {
  const where: Prisma.AdvertisementWhereInput = {};
  const { type, category, governorate, isResolved } = query as Record<string, string | undefined>;

  if (type && Object.values(AdType).includes(type as AdType)) where.type = type as AdType;
  if (category && Object.values(Category).includes(category as Category))
    where.category = category as Category;
  if (governorate && Object.values(Gov).includes(governorate as Gov))
    where.governorate = governorate as Gov;
  if (isResolved !== undefined) where.isResolved = isResolved === 'true';

  return where;
};

export const createAdvertisement = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const data = pickWritable(req.body);

    if (!data.type || !data.category || !data.governorate || !data.description || !data.contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'النوع والفئة والمحافظة والوصف ورقم الاتصال حقول مطلوبة',
      });
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files?.length ? await uploadImages(files) : [];

    const advertisement = await prisma.advertisement.create({
      data: {
        ...(data as Prisma.AdvertisementCreateInput),
        images,
        user: { connect: { id: userId } },
      },
      include: ownerSelect,
    });

    // الإعلان يُنشأ غير معتمد، فالمطابقة تنتظر موافقة المشرف
    // (تُستدعى من approveAdvertisement) — الاستدعاء هنا للاكتمال فقط.
    checkForMatches(advertisement.id);

    return res.status(201).json({ success: true, data: advertisement });
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    return res.status(500).json({ success: false, message: 'فشل في إنشاء الإعلان' });
  }
};

export const getAdvertisements = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const where: Prisma.AdvertisementWhereInput = {
      ...buildFilters(req.query),
      isApproved: true,
      isArchived: false,
    };

    const [total, advertisements] = await prisma.$transaction([
      prisma.advertisement.count({ where }),
      prisma.advertisement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: ownerSelect,
      }),
    ]);

    const viewerId = (req as AuthRequest).user?.id;
    const data = advertisements.map((ad) => hideContact(ad, viewerId));

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data,
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على الإعلانات:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const getAdvertisementById = async (req: Request, res: Response) => {
  try {
    const advertisement = await prisma.advertisement.findUnique({
      where: { id: req.params.id },
      include: ownerSelect,
    });

    if (!advertisement) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على الإعلان' });
    }

    const viewerId = (req as AuthRequest).user?.id;

    // إعلان غير معتمد لا يراه إلا صاحبه — سابقًا كان أي معرّف يكشف
    // أي إعلان بما فيه المرفوض وما ينتظر المراجعة
    if (!advertisement.isApproved && advertisement.userId !== viewerId) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على الإعلان' });
    }

    return res.status(200).json({
      success: true,
      data: hideContact(advertisement, viewerId),
    });
  } catch (error: any) {
    console.error('فشل في جلب الإعلان:', error);
    return res.status(500).json({ success: false, message: 'فشل في جلب الإعلان' });
  }
};

export const getUserAdvertisements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const status = req.query.status as string | undefined;

    const where: Prisma.AdvertisementWhereInput = { userId };
    if (status && Object.values(AdvertisementStatus).includes(status as any)) {
      where.status = status as any;
    }

    const [total, advertisements] = await prisma.$transaction([
      prisma.advertisement.count({ where }),
      prisma.advertisement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      success: true,
      count: advertisements.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: advertisements,
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على إعلانات المستخدم:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/** يتحقق من ملكية الإعلان ويعيده، أو يردّ بالخطأ المناسب */
const findOwnedAd = async (id: string, userId: string, res: Response) => {
  const ad = await prisma.advertisement.findUnique({ where: { id } });

  if (!ad) {
    res.status(404).json({ success: false, message: 'لم يتم العثور على الإعلان' });
    return null;
  }

  if (ad.userId !== userId) {
    res.status(403).json({
      success: false,
      message: 'لا يمكن تعديل إعلان ينتمي لمستخدم آخر',
    });
    return null;
  }

  return ad;
};

export const updateAdvertisement = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const existing = await findOwnedAd(req.params.id, userId, res);
    if (!existing) return;

    const data = pickWritable(req.body);

    const files = req.files as Express.Multer.File[] | undefined;
    if (files?.length) {
      const newImages = await uploadImages(files);
      data.images = [...existing.images, ...newImages];
    }

    // أي تعديل يُعيد الإعلان إلى المراجعة — وإلا أمكن نشر محتوى معتمد
    // ثم استبداله بمحتوى آخر بعد الموافقة
    const advertisement = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: {
        ...data,
        isApproved: false,
        status: AdvertisementStatus.PENDING,
        approvedAt: null,
        approvedById: null,
      },
      include: ownerSelect,
    });

    return res.status(200).json({ success: true, data: advertisement });
  } catch (error: any) {
    console.error('فشل في تحديث الإعلان:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحديث الإعلان' });
  }
};

export const deleteAdvertisement = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const existing = await findOwnedAd(req.params.id, userId, res);
    if (!existing) return;

    await prisma.advertisement.delete({ where: { id: req.params.id } });

    return res.status(200).json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (error: any) {
    console.error('فشل في حذف الإعلان:', error);
    return res.status(500).json({ success: false, message: 'فشل في حذف الإعلان' });
  }
};

export const markAsResolved = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const existing = await findOwnedAd(req.params.id, userId, res);
    if (!existing) return;

    const isResolved = req.body.isResolved === true || req.body.isResolved === 'true';

    const advertisement = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: {
        isResolved,
        status: isResolved ? AdvertisementStatus.RESOLVED : AdvertisementStatus.APPROVED,
        resolvedAt: isResolved ? new Date() : null,
      },
      include: ownerSelect,
    });

    return res.status(200).json({
      success: true,
      message: isResolved
        ? 'تم تحديث حالة الإعلان إلى "تم الحل" بنجاح'
        : 'تم إعادة فتح الإعلان بنجاح',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('فشل في تحديث حالة الإعلان:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحديث حالة الإعلان' });
  }
};

/** التسميات العربية للتعدادات — يستهلكها تطبيق الجوال لبناء القوائم */
const TYPE_LABELS: Record<string, string> = { lost: 'مفقود', found: 'موجود' };

const CATEGORY_LABELS: Record<string, string> = {
  passport: 'جواز سفر',
  national_id: 'بطاقة وطنية',
  driving_license: 'اجازة سوق',
  other: 'أخرى',
};

const GOVERNORATE_LABELS: Record<string, string> = {
  baghdad: 'بغداد',
  basra: 'البصرة',
  erbil: 'أربيل',
  sulaymaniyah: 'السليمانية',
  duhok: 'دهوك',
  nineveh: 'نينوى',
  kirkuk: 'كركوك',
  diyala: 'ديالى',
  anbar: 'الأنبار',
  babil: 'بابل',
  karbala: 'كربلاء',
  najaf: 'النجف',
  wasit: 'واسط',
  muthanna: 'المثنى',
  diwaniyah: 'الديوانية',
  maysan: 'ميسان',
  dhiqar: 'ذي قار',
  saladin: 'صلاح الدين',
};

const toOptions = (values: string[], labels: Record<string, string>) =>
  values.map((value) => ({ value, label: labels[value] ?? value }));

export const getConstants = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        types: toOptions(Object.values(AdvertisementType), TYPE_LABELS),
        categories: toOptions(Object.values(ItemCategory), CATEGORY_LABELS),
        governorates: toOptions(Object.values(Governorate), GOVERNORATE_LABELS),
      },
    });
  } catch (error) {
    console.error('خطأ في الحصول على القيم الثابتة:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

export const removeImage = async (req: Request, res: Response) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم رابط الصورة المراد حذفها',
      });
    }

    const existing = await findOwnedAd(req.params.id, userId, res);
    if (!existing) return;

    const advertisement = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { images: existing.images.filter((img) => img !== imageUrl) },
      include: ownerSelect,
    });

    return res.status(200).json({
      success: true,
      message: 'تم حذف الصورة بنجاح',
      data: advertisement,
    });
  } catch (error: any) {
    console.error('فشل في حذف الصورة:', error);
    return res.status(500).json({ success: false, message: 'فشل في حذف الصورة' });
  }
};
