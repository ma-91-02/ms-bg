# مشروع نظام المفقودات والموجودات

## نظرة عامة
نظام يتيح للمستخدمين الإبلاغ عن الأغراض المفقودة والموجودة.

## البدء السريع

### متطلبات التشغيل
- Node.js
- MongoDB

### تثبيت وتشغيل المشروع
1. تثبيت التبعيات
   ```
   npm install
   ```

2. إنشاء ملف `.env` بالمتغيرات المطلوبة
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/lostfound
   JWT_SECRET=your_secret_key
   ```

3. تشغيل المشروع
   ```
   npm run dev
   ```

## توثيق API
توثيق API متاح على `http://localhost:3001/api-docs` بعد تشغيل الخادم.

## المسارات الرئيسية

### مصادقة الجوال
- `POST /api/mobile/auth/send-otp` - إرسال رمز OTP
- `POST /api/mobile/auth/verify-otp` - التحقق من رمز OTP
- `PATCH /api/mobile/auth/complete-profile` - إكمال الملف الشخصي

### إدارة التقارير
- `POST /api/mobile/reports` - إنشاء تقرير جديد
- `GET /api/mobile/reports/my-reports` - عرض تقارير المستخدم
- `GET /api/mobile/reports/search` - البحث عن تقارير
