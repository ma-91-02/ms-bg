# نظام المصادقة

هذا المستند يشرح تفاصيل نظام المصادقة المستخدم في التطبيق.

## نظرة عامة

يستخدم النظام طريقتين مختلفتين للمصادقة:

1. **مصادقة المستخدمين (تطبيق الجوال)**: تعتمد على رموز OTP المرسلة عبر WhatsApp
2. **مصادقة المسؤولين (لوحة التحكم)**: تعتمد على اسم المستخدم وكلمة المرور

كلا النظامين يستخدمان JSON Web Tokens (JWT) لإدارة الجلسات.

## مصادقة المستخدمين (OTP)

### تدفق المصادقة

1. **طلب رمز OTP**:
   - المستخدم يدخل رقم الهاتف في التطبيق
   - الخادم يولد رمز OTP عشوائي (6 أرقام)
   - الرمز يتم تخزينه في قاعدة البيانات مع وقت انتهاء الصلاحية (15 دقيقة)
   - الرمز يرسل إلى رقم هاتف المستخدم عبر WhatsApp

2. **التحقق من الرمز**:
   - المستخدم يدخل الرمز المستلم
   - الخادم يتحقق من تطابق الرمز وعدم انتهاء صلاحيته
   - عند نجاح التحقق، يتم إنشاء JWT وإرساله إلى العميل

### رمز المحاكاة في التطوير

في بيئة التطوير (`NODE_ENV=development`)، يمكن استخدام الرمز "000000" للتخطي:

typescript
// في authController.ts
if (process.env.NODE_ENV === 'development' && otp === '000000') {
// تخطي التحقق الحقيقي وإنشاء JWT
}



## مصادقة المسؤولين

### تدفق المصادقة

1. **تسجيل الدخول**:
   - المسؤول يدخل اسم المستخدم وكلمة المرور
   - الخادم يتحقق من تطابق اسم المستخدم وكلمة المرور المشفرة
   - عند نجاح التحقق، يتم إنشاء JWT وإرساله إلى العميل

### إنشاء حساب المسؤول الأول

يتم إنشاء حساب المسؤول الافتراضي أثناء بدء التشغيل الأول:

typescript
// في config/admin.ts
async function createDefaultAdmin() {
const adminExists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
if (!adminExists) {
await Admin.create({
username: process.env.ADMIN_USERNAME,
password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
role: 'super'
});
console.log('✅ تم إنشاء حساب المسؤول الافتراضي');
}
}


## إدارة JSON Web Tokens

### إنشاء JWT


typescript
const signToken = (id: string, role?: string) => {
return jwt.sign(
{ id, role },
process.env.JWT_SECRET || 'fallback_secret',
{
expiresIn: process.env.JWT_EXPIRES_IN || '90d'
}
);
};


### التحقق من JWT

يتم استخدام middleware للتحقق من JWT في الطلبات:


typescript
// في middleware/auth.ts
export const protect = async (req: Request, res: Response, next: NextFunction) => {
try {
// 1) التحقق من وجود التوكن
let token;
if (req.headers.authorization?.startsWith('Bearer')) {
token = req.headers.authorization.split(' ')[1];
}
if (!token) {
return res.status(401).json({
success: false,
message: 'أنت غير مصرح لك بالوصول إلى هذا المورد'
});
}
// 2) التحقق من التوكن
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// 3) التحقق من وجود المستخدم
const currentUser = await User.findById(decoded.id);
if (!currentUser) {
return res.status(401).json({
success: false,
message: 'المستخدم صاحب هذا التوكن لم يعد موجوداً'
});
}
// 4) إرسال المستخدم للطلب
req.user = currentUser;
next();
} catch (error) {
return res.status(401).json({
success: false,
message: 'فشل المصادقة'
});
}
};

### تجديد JWT

لا يوجد تجديد تلقائي للـ JWT. عند انتهاء الصلاحية، يجب على المستخدم:
- التطبيق: طلب رمز OTP جديد
- المسؤول: تسجيل الدخول مرة أخرى

## أمان المصادقة

- **تشفير كلمات المرور**: يستخدم bcryptjs مع 12 جولة من الملح
- **انتهاء صلاحية OTP**: 15 دقيقة لتقليل مخاطر الاستغلال
- **محدودية المحاولات**: 5 محاولات فاشلة تؤدي إلى حظر مؤقت (15 دقيقة)
- **HTTPS**: جميع طلبات المصادقة يجب أن تتم عبر HTTPS في بيئة الإنتاج
- **CORS**: تقييد طلبات المصادقة من مصادر معتمدة فقط

## اعتبارات أمنية إضافية

- تجنب هجمات CSRF باستخدام نهج الـ JWT
- حماية من هجمات XSS بتخزين JWT في ذاكرة التخزين المحلية وليس في الك