"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../../models/admin/Admin"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// توحيد طريقة إنشاء التوكن
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    try {
        return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });
    }
    catch (error) {
        console.error('خطأ في إنشاء التوكن:', error);
        throw new Error('خطأ في إنشاء التوكن JWT');
    }
};
const login = async (req, res) => {
    try {
        console.log('👤 محاولة تسجيل دخول الأدمن...');
        console.log('📝 الطلب:', { body: req.body });
        const { username, password } = req.body;
        // التحقق من وجود البيانات
        if (!username || !password) {
            console.log('❌ اسم المستخدم أو كلمة المرور غير موجودة');
            return res.status(400).json({
                success: false,
                message: 'يرجى تقديم اسم المستخدم وكلمة المرور'
            });
        }
        // البحث عن المستخدم
        console.log(`🔍 البحث عن المشرف: ${username}`);
        const admin = await Admin_1.default.findOne({ username });
        // طباعة استعلام MongoDB
        console.log('MongoDB Query:', Admin_1.default.findOne({ username }).getQuery());
        console.log(`📊 نتيجة البحث: ${admin ? 'تم العثور على المشرف' : 'المشرف غير موجود'}`);
        if (admin) {
            console.log('📋 معلومات المشرف:', {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                isActive: admin.isActive,
                // لا تطبع كلمة المرور المشفرة!
                hasPassword: !!admin.password
            });
        }
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'خطأ في اسم المستخدم أو كلمة المرور'
            });
        }
        // التحقق من كلمة المرور
        console.log('🔑 جاري التحقق من كلمة المرور...');
        // التحقق المباشر من كلمة المرور باستخدام bcrypt
        let isMatch;
        try {
            isMatch = await bcryptjs_1.default.compare(password, admin.password);
            console.log(`📊 نتيجة التحقق المباشر من bcrypt: ${isMatch ? 'صحيحة ✅' : 'خاطئة ❌'}`);
        }
        catch (error) {
            console.error('❌ خطأ في التحقق المباشر من كلمة المرور:', error);
            isMatch = false;
        }
        // للمشرف الافتراضي فقط - تحقق خاص
        if (!isMatch && username === 'admin' && password === 'admin' && process.env.ADMIN_PASSWORD === 'admin') {
            console.log('⚠️ استخدام التحقق الخاص للمشرف الافتراضي...');
            isMatch = true;
            // تحديث كلمة المرور للمشرف الافتراضي لتصحيح المشكلة مستقبلاً
            try {
                console.log('🔄 محاولة تحديث كلمة مرور المشرف الافتراضي...');
                const salt = await bcryptjs_1.default.genSalt(10);
                const hashedPassword = await bcryptjs_1.default.hash('admin', salt);
                // تحديث كلمة المرور مباشرة بدون استخدام save() لتجنب هوك pre-save
                await Admin_1.default.updateOne({ _id: admin._id }, { $set: { password: hashedPassword } });
                console.log('✅ تم تحديث كلمة مرور المشرف الافتراضي بنجاح');
            }
            catch (updateError) {
                console.error('❌ فشل تحديث كلمة مرور المشرف الافتراضي:', updateError);
            }
        }
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'خطأ في اسم المستخدم أو كلمة المرور'
            });
        }
        // تحديث تاريخ آخر تسجيل دخول
        admin.lastLogin = new Date();
        await admin.save();
        // إنشاء توكن JWT
        const token = jsonwebtoken_1.default.sign({
            id: admin._id
        }, process.env.JWT_SECRET || 'default-secret-key', {
            expiresIn: process.env.JWT_EXPIRES_IN || '90d'
        });
        return res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch (error) {
        console.error('❌ خطأ في وحدة تحكم الأدمن:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول',
            error: error.message
        });
    }
};
exports.login = login;
const validateToken = async (req, res) => {
    try {
        // وصول إلى هذه النقطة يعني أن المستخدم قد تم مصادقته بالفعل من خلال middleware
        return res.status(200).json({
            success: true,
            message: 'التوكن صالح'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من التوكن',
            error: error.message
        });
    }
};
exports.validateToken = validateToken;
//# sourceMappingURL=authController.js.map