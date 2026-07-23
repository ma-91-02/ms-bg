import { Request, Response } from 'express';
import prisma from '../../config/prisma';

/**
 * المفضلة.
 *
 * كانت مصفوفة ObjectId داخل مستند المستخدم؛ صارت جدول ربط `favorites`
 * بمفتاح مركّب (userId, advertisementId).
 *
 * علّة أُصلحت ضمنًا: فحص التكرار السابق كان
 * `user.favorites.includes(new mongoose.Types.ObjectId(adId))` — و`includes`
 * تقارن المراجع لا القيم، فترجع false دائمًا مهما كان الإعلان مضافًا.
 * المفتاح المركّب يجعل التكرار مستحيلًا على مستوى قاعدة البيانات.
 */

const requireUser = (req: Request, res: Response): string | null => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'غير مصرح به. يرجى تسجيل الدخول',
    });
    return null;
  }
  return userId;
};

export const getFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return res;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { advertisement: true },
    });

    // نفس شكل الاستجابة السابق: مصفوفة إعلانات لا مصفوفة سجلات ربط
    return res.status(200).json({
      success: true,
      data: favorites.map((f) => f.advertisement),
    });
  } catch (error: any) {
    console.error('خطأ في جلب الإعلانات المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإعلانات المفضلة',
    });
  }
};

export const addToFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return res;

    const { adId } = req.params;

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: adId },
      select: { id: true },
    });

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان',
      });
    }

    try {
      await prisma.favorite.create({
        data: { userId, advertisementId: adId },
      });
    } catch (e: any) {
      // P2002 = خرق قيد التفرّد، أي أنه في المفضلة أصلًا
      if (e?.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'الإعلان موجود في المفضلة بالفعل',
        });
      }
      throw e;
    }

    return res.status(200).json({
      success: true,
      message: 'تمت إضافة الإعلان إلى المفضلة بنجاح',
    });
  } catch (error: any) {
    console.error('خطأ في إضافة الإعلان إلى المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الإعلان إلى المفضلة',
    });
  }
};

export const removeFromFavorites = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return res;

    const { adId } = req.params;

    const result = await prisma.favorite.deleteMany({
      where: { userId, advertisementId: adId },
    });

    if (result.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'الإعلان غير موجود في المفضلة',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'تمت إزالة الإعلان من المفضلة بنجاح',
    });
  } catch (error: any) {
    console.error('خطأ في إزالة الإعلان من المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إزالة الإعلان من المفضلة',
    });
  }
};
