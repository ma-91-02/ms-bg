import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Advertisement from '../../models/mobile/Advertisement';
import User from '../../models/mobile/User';

// جلب الإعلانات المفضلة للمستخدم
export const getFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = req.user._id;
    console.log('Getting favorites for user:', userId);
    
    // جلب المستخدم مع الإعلانات المفضلة
    const user = await User.findById(userId).populate('favorites');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    console.log('User favorites:', user.favorites);
    
    // التأكد من أن المفضلة هي مصفوفة
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    
    // إرجاع الإعلانات المفضلة
    return res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error: any) {
    console.error('خطأ في جلب الإعلانات المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإعلانات المفضلة',
      error: error.message
    });
  }
};

// إضافة إعلان إلى المفضلة
export const addToFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = req.user._id;
    const { adId } = req.params;
    
    // التحقق من وجود الإعلان
    const advertisement = await Advertisement.findById(adId);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان'
      });
    }
    
    // إضافة الإعلان إلى المفضلة
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    // التحقق من عدم وجود الإعلان في المفضلة بالفعل
    if (user.favorites.includes(new mongoose.Types.ObjectId(adId))) {
      return res.status(400).json({
        success: false,
        message: 'الإعلان موجود في المفضلة بالفعل'
      });
    }
    
    // إضافة الإعلان إلى المفضلة
    user.favorites.push(new mongoose.Types.ObjectId(adId));
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'تمت إضافة الإعلان إلى المفضلة بنجاح'
    });
  } catch (error: any) {
    console.error('خطأ في إضافة الإعلان إلى المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الإعلان إلى المفضلة',
      error: error.message
    });
  }
};

// إزالة إعلان من المفضلة
export const removeFromFavorites = async (req: Request, res: Response): Promise<Response> => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يرجى تسجيل الدخول'
      });
    }

    const userId = req.user._id;
    const { adId } = req.params;
    
    // إزالة الإعلان من المفضلة
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستخدم'
      });
    }
    
    // التحقق من وجود الإعلان في المفضلة
    const adObjectId = new mongoose.Types.ObjectId(adId);
    const adIndex = user.favorites.findIndex(id => id.equals(adObjectId));
    
    if (adIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'الإعلان غير موجود في المفضلة'
      });
    }
    
    // إزالة الإعلان من المفضلة
    user.favorites.splice(adIndex, 1);
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'تمت إزالة الإعلان من المفضلة بنجاح'
    });
  } catch (error: any) {
    console.error('خطأ في إزالة الإعلان من المفضلة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إزالة الإعلان من المفضلة',
      error: error.message
    });
  }
}; 