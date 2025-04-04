import { Request, Response } from 'express';
import AdvertisementMatch, { MatchStatus } from '../../models/mobile/AdvertisementMatch';
import { AuthRequest } from '../../types/express';

// الحصول على مطابقات الإعلانات الخاصة بالمستخدم
export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    // البحث عن الإعلانات الخاصة بالمستخدم (مفقودة أو موجودة)
    const matches = await AdvertisementMatch.find({
      status: MatchStatus.APPROVED,
      $or: [
        // مطابقات حيث المستخدم هو صاحب إعلان المفقودات
        { 'lostAdvertisementId.userId': authReq.user.id },
        // مطابقات حيث المستخدم هو صاحب إعلان الموجودات
        { 'foundAdvertisementId.userId': authReq.user.id }
      ]
    })
    .populate({
      path: 'lostAdvertisementId',
      select: 'category governorate ownerName itemNumber description images userId',
      populate: { path: 'userId', select: 'fullName' }
    })
    .populate({
      path: 'foundAdvertisementId',
      select: 'category governorate ownerName itemNumber description images userId contactPhone',
      populate: { path: 'userId', select: 'fullName phoneNumber' }
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على المطابقات:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: error.message
    });
  }
}; 