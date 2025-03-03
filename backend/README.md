# نظام إدارة المفقودات والموجودات - الخلفية (Backend)

## نظرة عامة

نظام متكامل لإدارة الإبلاغات عن الأغراض المفقودة والموجودة، مع دعم تطبيقات الجوال ولوحة تحكم للمسؤولين.

![شعار النظام](docs/images/logo.png)

## الخصائص الرئيسية

- مصادقة المستخدمين عبر رمز OTP
- إدارة تقارير المفقودات والموجودات
- نظام مراجعة من قبل المسؤولين
- بحث جغرافي متقدم
- دعم رفع وتخزين الصور

## التقنيات المستخدمة

- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JWT للمصادقة
- Twilio لخدمة الرسائل النصية

## البدء السريع

### المتطلبات الأساسية

- Node.js (v14 أو أحدث)
- MongoDB (v4.4 أو أحدث)
- npm أو yarn

### التثبيت

1. استنساخ المستودع:
   ```bash
   git clone https://github.com/username/lostfound-backend.git
   cd lostfound-backend
   ```

2. تثبيت التبعيات:
   ```bash
   npm install
   ```

3. إنشاء ملف `.env` (انظر `.env.example`)

4. تشغيل التطبيق:
   ```bash
   npm run dev   # وضع التطوير
   npm start     # وضع الإنتاج
   ```

## التوثيق

للمزيد من المعلومات المفصلة، يرجى الاطلاع على:

- [دليل التطوير](docs/development-guide.md)
- [مرجع API](docs/api-reference.md)
- [مخطط قاعدة البيانات](docs/database-schema.md)
- [نظام المصادقة](docs/authentication.md)
- [دليل النشر](docs/deployment.md)

## المساهمة

يرجى قراءة [إرشادات المساهمة](CONTRIBUTING.md) قبل البدء.

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

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
