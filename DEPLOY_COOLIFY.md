# النشر على Coolify

## قبل النشر — شرطان إلزاميان

**1. لا تنشر قبل أن يمر البناء.** تحقّق محليًا أولًا:

```bash
cd backend && npx tsc --noEmit --skipLibCheck
```

**2. `DEMO_MODE` يجب أن تبقى `false`.** حين تكون `true` يقبل النظام الرمز `000000`
لأي رقم هاتف — أي دخول لأي حساب بلا كلمة مرور. الخادم يرفض الإقلاع لو فُعّلت
مع `NODE_ENV=production`، لكن لا تعتمد على هذا الحارز وحده.

---

## خطوات النشر

### 1. إنشاء المورد

في Coolify: **New Resource → Docker Compose**، واربطه بمستودع
`github.com/ma-91-02/ms-bg` على الفرع المطلوب، ثم اختر الملف
`docker-compose.coolify.yml`.

### 2. متغيرات البيئة

في تبويب **Environment Variables**:

| المتغير | القيمة | ملاحظة |
|---|---|---|
| `POSTGRES_USER` | `msbg` | |
| `POSTGRES_PASSWORD` | — | ولّدها عشوائيًا، 32 محرفًا |
| `POSTGRES_DB` | `ms_main_db` | |
| `JWT_SECRET` | — | **32 محرفًا على الأقل**، وإلا رفض الخادم الإقلاع |
| `JWT_EXPIRES_IN` | `30d` | |
| `ADMIN_USERNAME` | `admin` | |
| `ADMIN_PASSWORD` | — | كلمة قوية — يُنشأ بها حساب المشرف عند أول إقلاع |
| `ADMIN_EMAIL` | بريدك | |
| `CORS_ORIGINS` | `https://<نطاق-اللوحة>` | نطاق لوحة التحكم بالضبط |
| `REACT_APP_API_URL` | `https://<نطاق-الخلفية>` | يُضمَّن وقت البناء |

لتوليد الأسرار:

```bash
openssl rand -base64 32
```

### 3. النطاقات

- **backend** → نطاق فرعي مثل `api.example.com` (المنفذ 3001)
- **frontend** → النطاق الرئيسي مثل `panel.example.com` (المنفذ 80)
- **postgres** → **بلا نطاق**، لا يُنشر على الإنترنت إطلاقًا

Coolify يتولى شهادات TLS تلقائيًا عبر Let's Encrypt.

### 4. التخزين الدائم

وحدتا تخزين معرَّفتان في ملف الـ compose ويجب ألا تُحذفا بين عمليات النشر:

- `pgdata` — قاعدة البيانات
- `uploads` — صور الإعلانات المرفوعة (تُفقد بلا رجعة إن ضاعت)

### 5. النشر

اضغط **Deploy**. سلسلة الإقلاع:

1. `postgres` يقلع وينتظر `pg_isready`
2. `backend` يشغّل `prisma migrate deploy` (آمن للتكرار) ثم الخادم
3. `setupAdmin` ينشئ حساب المشرف إن لم يكن موجودًا
4. `frontend` يُبنى ويُقدَّم عبر nginx

---

## بعد أول نشر — خطوة يدوية إلزامية

دالة تطبيع الأسماء العربية وفهارس trigram **ليست جزءًا من ترحيلات Prisma**
ويجب تطبيقها مرة واحدة، وإلا تعطّلت المطابقة بالكامل:

```bash
docker exec -i <اسم-حاوية-postgres> psql -U msbg -d ms_main_db < backend/prisma/sql/001_arabic_normalization.sql
```

للتحقق من نجاحها:

```sql
SELECT similarity(normalize_ar('أحمد علي'), normalize_ar('احمد علي'));
-- يجب أن تُرجع 1.00
```

---

## التحقق بعد النشر

```bash
curl https://<نطاق-الخلفية>/health
# {"status":"ok"}
```

ثم افتح لوحة التحكم وسجّل الدخول بـ `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## ترحيل البيانات من MongoDB

إن كانت هناك بيانات إنتاج في Atlas، شغّل الترحيل **مرة واحدة** قبل فتح
النظام للمستخدمين:

```bash
MONGODB_URI="mongodb+srv://..." npm run db:migrate-from-mongo
```

السكربت يحافظ على المعرّفات الأصلية، فلا تنكسر التوكنات ولا الروابط القائمة.

---

## استكشاف الأعطال

| العَرَض | السبب الأرجح |
|---|---|
| الخادم يرفض الإقلاع مع رسالة عن `JWT_SECRET` | أقل من 32 محرفًا |
| الخادم يرفض الإقلاع مع رسالة عن `DEMO_MODE` | `true` مع `NODE_ENV=production` |
| اللوحة تفتح لكن كل الطلبات تفشل | `REACT_APP_API_URL` خاطئ — يستلزم **إعادة بناء** لا إعادة تشغيل |
| `غير مسموح بواسطة CORS` | `CORS_ORIGINS` لا يطابق نطاق اللوحة حرفيًا (بما فيه `https://`) |
| المطابقة لا تُنتج نتائج | لم يُطبَّق `001_arabic_normalization.sql` |
| الصور تختفي بعد إعادة النشر | وحدة `uploads` غير مربوطة |
