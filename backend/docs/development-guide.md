# دليل تطوير النظام الخلفي

هذا الدليل يوفر المعلومات اللازمة لإعداد بيئة التطوير والبدء في تطوير النظام.

## إعداد بيئة التطوير

### المتطلبات الأساسية

- Node.js (نسخة 14 أو أحدث)
- MongoDB (نسخة 4.4 أو أحدث)
- npm أو yarn
- VS Code (موصى به) مع الإضافات التالية:
  - ESLint
  - Prettier
  - TypeScript Extension

### خطوات الإعداد

1. استنساخ المستودع:
   ```bash
   git clone https://github.com/username/lostfound-backend.git
   cd lostfound-backend
   ```

2. تثبيت التبعيات:
   ```bash
   npm install
   ```

3. إنشاء ملف `.env` (انظر `.env.example`):
   ```bash
   cp .env.example .env
   PORT=3001
MONGODB_URI=mongodb://localhost:27017/ms_main_db
JWT_SECRET=your_development_jwt_secret
JWT_EXPIRES_IN=90d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
NODE_ENV=development

4. بدء خادم MongoDB المحلي:
   ```bash
   mongod
   ```


5. تشغيل التطبيق في وضع التطوير:

   ```bash
    
## أوامر التشغيل المتاحة

- `npm run dev`: تشغيل التطبيق في وضع التطوير مع إعادة التحميل التلقائي
- `npm run build`: ترجمة التطبيق من TypeScript إلى JavaScript
- `npm start`: تشغيل التطبيق المترجم في وضع الإنتاج
- `npm run clean`: حذف ملفات الترجمة
- `npm run lint`: فحص أنماط الكود
- `npm run test`: تشغيل اختبارات الوحدة
- `npm run docs`: توليد توثيق API

## هيكل المشروع
backend/
├── src/
│ ├── config/ # إعدادات التطبيق
│ ├── controllers/ # منطق الطلبات والاستجابات
│ │ ├── admin/ # تحكمات لوحة المسؤول
│ │ └── mobile/ # تحكمات تطبيق الجوال
│ ├── middleware/ # middleware للمصادقة وتحميل الملفات
│ ├── models/ # مخططات قاعدة البيانات
│ ├── routes/ # تعريف مسارات API
│ ├── services/ # خدمات خارجية مثل SMS
│ └── index.ts # نقطة الدخول الرئيسية
├── uploads/ # مجلد لتخزين الملفات المرفوعة
├── tests/ # اختبارات الوحدة
└── types/ # تعريفات TypeScript


## إرشادات التكويد

### اصطلاحات التسمية

- **الملفات**: camelCase لملفات التحكم والخدمات، PascalCase للنماذج
- **المتغيرات والدوال**: camelCase
- **الفئات**: PascalCase
- **الثوابت**: UPPER_SNAKE_CASE

### نمط الكود

يتبع المشروع نمط تكويد Airbnb مع بعض التعديلات. راجع ملف `.eslintrc` للتفاصيل.

### إرشادات Git

- استخدم فروع للميزات: `feature/feature-name`
- استخدم فروع للإصلاحات: `fix/bug-name`
- اجعل الالتزامات (commits) صغيرة ومركزة
- استخدم رسائل التزام وصفية

## عملية التطوير

1. اسحب أحدث تغييرات من الفرع الرئيسي
2. أنشئ فرعًا جديدًا لعملك
3. قم بالتغييرات والاختبارات
4. تأكد من اجتياز الاختبارات وفحص الأنماط
5. أرسل طلب سحب مع وصف للتغييرات

## اختبار API

يمكنك اختبار واجهة API باستخدام:

1. **Swagger UI**: متاح على مسار `/api-docs` بعد تشغيل التطبيق
2. **Postman**: قم بتنزيل مجموعة Postman من [هنا]
3. **curl**: أمثلة لطلبات curl مدرجة في [مرجع API](api-reference.md)

## تلميحات وأفضل الممارسات

- استخدم async/await بدلاً من الوعود المتسلسلة
- تعامل مع الأخطاء بشكل مناسب باستخدام try/catch
- اكتب اختبارات للوظائف الحرجة
- حافظ على التوثيق محدثًا
- استخدم التعليقات لتوضيح المنطق المعقد

## الاستكشاف وإصلاح الأخطاء

راجع [أدلة استكشاف الأخطاء وإصلاحها](troubleshooting.md) للمشكلات الشائعة.

