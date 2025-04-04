"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromFavorites = exports.addToFavorites = exports.getFavorites = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Advertisement_1 = __importDefault(require("../../models/mobile/Advertisement"));
const User_1 = __importDefault(require("../../models/mobile/User"));
// جلب الإعلانات المفضلة للمستخدم
const getFavorites = async (req, res) => {
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
        const user = await User_1.default.findById(userId).populate('favorites');
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
    }
    catch (error) {
        console.error('خطأ في جلب الإعلانات المفضلة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإعلانات المفضلة',
            error: error.message
        });
    }
};
exports.getFavorites = getFavorites;
// إضافة إعلان إلى المفضلة
const addToFavorites = async (req, res) => {
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
        const advertisement = await Advertisement_1.default.findById(adId);
        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الإعلان'
            });
        }
        // إضافة الإعلان إلى المفضلة
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المستخدم'
            });
        }
        // التحقق من عدم وجود الإعلان في المفضلة بالفعل
        if (user.favorites.includes(new mongoose_1.default.Types.ObjectId(adId))) {
            return res.status(400).json({
                success: false,
                message: 'الإعلان موجود في المفضلة بالفعل'
            });
        }
        // إضافة الإعلان إلى المفضلة
        user.favorites.push(new mongoose_1.default.Types.ObjectId(adId));
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'تمت إضافة الإعلان إلى المفضلة بنجاح'
        });
    }
    catch (error) {
        console.error('خطأ في إضافة الإعلان إلى المفضلة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة الإعلان إلى المفضلة',
            error: error.message
        });
    }
};
exports.addToFavorites = addToFavorites;
// إزالة إعلان من المفضلة
const removeFromFavorites = async (req, res) => {
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
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المستخدم'
            });
        }
        // التحقق من وجود الإعلان في المفضلة
        const adObjectId = new mongoose_1.default.Types.ObjectId(adId);
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
    }
    catch (error) {
        console.error('خطأ في إزالة الإعلان من المفضلة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إزالة الإعلان من المفضلة',
            error: error.message
        });
    }
};
exports.removeFromFavorites = removeFromFavorites;
//# sourceMappingURL=favoriteController.js.map