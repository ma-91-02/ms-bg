import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin/Admin';
import bcrypt from 'bcryptjs';

// توحيد طريقة إنشاء التوكن
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  try {
    return jwt.sign(
      { id },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );
  } catch (error) {
    console.error('خطأ في إنشاء التوكن:', error);
    throw new Error('خطأ في إنشاء التوكن JWT');
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
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
    const admin = await Admin.findOne({ username });
    
    // طباعة استعلام MongoDB
    console.log('MongoDB Query:', Admin.findOne({ username }).getQuery());
    
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
      isMatch = await bcrypt.compare(password, admin.password);
      console.log(`📊 نتيجة التحقق المباشر من bcrypt: ${isMatch ? 'صحيحة ✅' : 'خاطئة ❌'}`);
    } catch (error) {
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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        
        // تحديث كلمة المرور مباشرة بدون استخدام save() لتجنب هوك pre-save
        await Admin.updateOne({ _id: admin._id }, { $set: { password: hashedPassword } });
        console.log('✅ تم تحديث كلمة مرور المشرف الافتراضي بنجاح');
      } catch (updateError) {
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
    const token = jwt.sign({ 
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
  } catch (error: any) {
    console.error('❌ خطأ في وحدة تحكم الأدمن:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
      error: error.message
    });
  }
};

export const validateToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    // وصول إلى هذه النقطة يعني أن المستخدم قد تم مصادقته بالفعل من خلال middleware
    return res.status(200).json({
      success: true,
      message: 'التوكن صالح'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من التوكن',
      error: error.message
    });
  }
};