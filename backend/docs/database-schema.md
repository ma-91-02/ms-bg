# مخطط قاعدة البيانات

هذا المستند يوضح هيكل قاعدة البيانات وعلاقات النماذج في النظام.

## مخطط العلاقات

![ER Diagram](images/er-diagram.png)

## نماذج قاعدة البيانات

### نموذج المستخدم (User)

يمثل مستخدمي تطبيق الجوال.
typescript
interface User {
id: ObjectId;
phoneNumber: string; // رقم الهاتف (مفتاح فريد)
otp: string; // رمز التحقق المؤقت
otpExpires: Date; // تاريخ انتهاء صلاحية الرمز
name?: string; // اسم المستخدم
userType?: 'seeker' | 'finder'; // نوع المستخدم
idNumber?: string; // رقم الهوية
isProfileComplete: boolean; // اكتمال الملف الشخصي
createdAt: Date; // تاريخ الإنشاء
updatedAt: Date; // تاريخ التحديث
}


### نموذج المسؤول (Admin)

يمثل مسؤولي النظام الذين يديرون لوحة التحكم.
typescript
interface Admin {
id: ObjectId;
username: string; // اسم المستخدم (مفتاح فريد)
password: string; // كلمة المرور (مشفرة)
role: 'admin' | 'super'; // دور المسؤول
createdAt: Date; // تاريخ الإنشاء
updatedAt: Date; // تاريخ التحديث
}

### نموذج التقرير (Report)

يمثل تقارير المفقودات والموجودات.
typescript
interface Report {
id: ObjectId;
user: ObjectId; // مرجع للمستخدم
type: 'lost' | 'found'; // نوع التقرير
title: string; // عنوان التقرير
description: string; // وصف التقرير
category: string; // فئة العنصر
location: { // موقع الفقدان/العثور
type: 'Point';
coordinates: [number, number]; // [longitude, latitude]
};
address?: string; // العنوان النصي
date: Date; // تاريخ الفقدان/العثور
images: string[]; // مسارات الصور
documentType?: string; // نوع المستند (إن وجد)
documentId?: string; // رقم المستند (إن وجد)
status: 'pending' | 'approved' | 'rejected'; // حالة التقرير
contactInfo?: string; // معلومات الاتصال
adminNotes?: string; // ملاحظات المسؤول
createdAt: Date; // تاريخ الإنشاء
updatedAt: Date; // تاريخ التحديث
}

## مؤشرات قاعدة البيانات

لتحسين أداء الاستعلامات، تم إنشاء المؤشرات التالية:

### مؤشرات المستخدم
- `phoneNumber`: مؤشر فريد للبحث عن المستخدمين برقم الهاتف

### مؤشرات التقارير
- `user`: للبحث عن التقارير حسب المستخدم
- `status`: للبحث عن التقارير حسب الحالة
- `type`: للبحث عن التقارير حسب النوع (مفقود/موجود)
- `category`: للبحث عن التقارير حسب الفئة
- `location`: مؤشر جغرافي للبحث المكاني
- `date`: للبحث حسب التاريخ
- `documentId`: للبحث عن المستندات برقم المستند

## علاقات البيانات

- كل تقرير ينتمي إلى مستخدم واحد (علاقة 1:N)
- المستخدم يمكن أن يكون له عدة تقارير (علاقة 1:N)

## استعلامات شائعة

### البحث عن التقارير المتطابقة للمستندات
javascript
// البحث عن المستندات التي تطابق نوع المستند ورقمه
db.reports.find({
documentType: "هوية شخصية",
documentId: "12345678",
status: "approved"
})

### البحث الجغرافي
javascript
// البحث عن التقارير ضمن مسافة 1 كم من نقطة محددة
db.reports.find({
location: {
$near: {
$geometry: {
type: "Point",
coordinates: [44.366145, 33.315241]
},
$maxDistance: 1000
}
},
status: "approved"
})

## صيانة قاعدة البيانات

- التقارير القديمة (> 1 سنة): ترحيلها إلى مجموعة أرشيفية
- رموز OTP: حذف المنتهية الصلاحية بشكل دوري
- مراقبة حجم المجموعات: خاصة مجموعة التقارير التي تنمو بسرعة

## صيانة قاعدة البيانات

- التقارير القديمة (> 1 سنة): ترحيلها إلى مجموعة أرشيفية
- رموز OTP: حذف المنتهية الصلاحية بشكل دوري
- مراقبة حجم المجموعات: خاصة مجموعة التقارير التي تنمو بسرعة