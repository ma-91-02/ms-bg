<think>
المستخدم يطلب توثيق المعلومات التي قدمتها بطريقة يمكن تحميلها أو نسخها للرجوع إليها أثناء تنفيذ المشروع. سأقوم بإعداد وثيقة مفصلة بتنسيق Markdown تحتوي على:
توثيق كامل للـ API
هيكل قاعدة البيانات المقترح
خطة التنفيذ
نصائح وإرشادات للتطوير
سأجعل التنسيق منظمًا ومرتبًا بحيث يسهل على المستخدم نسخه أو تحميله كملف Markdown (.md) للرجوع إليه لاحقًا.
</think>
توثيق API نظام إدارة المستمسكات المفقودة والموجودة
المحتويات
1. API للتطبيق الجوال
API للوحة التحكم
3. هيكل قواعد البيانات
نظام المطابقة الآلي
نظام النقاط والمكافآت
نظام الإشعارات
7. مخطط سير العمل
نصائح للتنفيذ
---
API للتطبيق الجوال
1. نظام المصادقة
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/mobile/auth/register/send-otp | POST | إرسال OTP للتسجيل الجديد | phoneNumber | { success, message, expiresAt } |
| /api/mobile/auth/register/verify-otp | POST | التحقق من OTP للتسجيل | phoneNumber, otp | { success, message, userId, token } |
| /api/mobile/auth/register/complete-profile | POST | إكمال الملف الشخصي | fullName, password, email? | { success, message, user } |
| /api/mobile/auth/login | POST | تسجيل الدخول | phoneNumber, password | { success, message, user, token } |
| /api/mobile/auth/reset-password/request | POST | طلب إعادة تعيين كلمة المرور | phoneNumber | { success, message, expiresAt } |
| /api/mobile/auth/reset-password/verify-otp | POST | التحقق من OTP لإعادة التعيين | phoneNumber, otp | { success, message, resetToken } |
| /api/mobile/auth/reset-password/set-new-password | POST | تعيين كلمة مرور جديدة | resetToken, newPassword | { success, message } |
2. نظام إدارة المستمسكات
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/mobile/documents | POST | إنشاء إعلان جديد | type, documentType, ownerName, governorate, description, contactPhone | { success, message, document } |
| /api/mobile/documents/:documentId/images | POST | رفع صور للمستمسك | image (multipart) | { success, message, images } |
| /api/mobile/documents/search | GET | البحث عن المستمسكات | type?, governorate?, documentType?, keyword?, page?, limit? | { success, documents, total, page, limit } |
| /api/mobile/documents/:documentId | GET | عرض تفاصيل مستمسك | - | { success, document } |
| /api/mobile/profile/documents | GET | عرض مستمسكات المستخدم | status?, page?, limit? | { success, documents, total, page, limit } |
3. نظام التواصل والمكافآت
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/mobile/documents/:documentId/request-contact | POST | طلب التواصل | message | { success, message, requestId } |
| /api/mobile/contact-requests | GET | عرض طلبات التواصل | status?, page?, limit? | { success, requests, total, page, limit } |
| /api/mobile/contact-requests/:requestId/approve | PATCH | موافقة على طلب تواصل | - | { success, message, contactInfo } |
| /api/mobile/rewards/points | GET | معرفة رصيد النقاط | - | { success, points, history } |
| /api/mobile/rewards/available | GET | عرض الهدايا المتاحة | - | { success, rewards } |
| /api/mobile/rewards/redeem | POST | استبدال النقاط بهدية | rewardId | { success, message, redemption } |
4. نظام الإشعارات
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/mobile/notifications | GET | عرض الإشعارات | page?, limit?, unreadOnly? | { success, notifications, total, unreadCount } |
| /api/mobile/notifications/:notificationId/read | PATCH | تحديث حالة الإشعار | - | { success, message } |
| /api/mobile/notifications/read-all | PATCH | تحديث كل الإشعارات كمقروءة | - | { success, message } |
---
API للوحة التحكم
1. لوحة المعلومات
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/admin/dashboard/stats | GET | إحصائيات عامة | - | { success, data: { usersCount, ads, matches, contactRequests } } |
| /api/admin/dashboard/recent-activity | GET | النشاطات الحديثة | limit? | { success, activities } |
2. إدارة المستخدمين
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/admin/users | GET | قائمة المستخدمين | search?, page?, limit? | { success, users, total, page, limit } |
| /api/admin/users/:id | GET | تفاصيل مستخدم | - | { success, user } |
| /api/admin/users/:id/block | PUT | تحديث حالة حظر مستخدم | isBlocked | { success, user } |
| /api/admin/users/:id | DELETE | حذف مستخدم | - | { success, message } |
3. إدارة الإعلانات
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/admin/advertisements | GET | كل الإعلانات | page?, limit? | { success, data } |
| /api/admin/advertisements/pending | GET | الإعلانات المنتظرة للموافقة | page?, limit? | { success, data } |
| /api/admin/advertisements/:id | GET | تفاصيل إعلان | - | { success, data } |
| /api/admin/advertisements/:id | PUT | تحديث إعلان | FormData | { success, data } |
| /api/admin/advertisements/:id | DELETE | حذف إعلان | - | { success, message } |
| /api/admin/advertisements/:id/approve | PUT | موافقة على إعلان | - | { success, data } |
| /api/admin/advertisements/:id/reject | PUT | رفض إعلان | - | { success, data } |
| /api/admin/advertisements/:id/resolve | PUT | تعيين إعلان كمنتهي | - | { success, data } |
| /api/admin/advertisements/status/:status | GET | الإعلانات حسب الحالة | status, page?, limit? | { success, data } |
4. إدارة المطابقات
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/admin/matches | GET | كل المطابقات | page?, limit? | { success, data } |
| /api/admin/matches/pending | GET | المطابقات المعلقة | page?, limit? | { success, data } |
| /api/admin/matches/:id/approve | PUT | موافقة على مطابقة | - | { success, data } |
| /api/admin/matches/:id/reject | PUT | رفض مطابقة | - | { success, data } |
| /api/admin/matches/run-matching | GET | تشغيل المطابقة لكل الإعلانات | - | { success, data } |
| /api/admin/matches/run-matching/:advertisementId | GET | تشغيل المطابقة لإعلان معين | - | { success, data } |
| /api/admin/matches/cleanup-duplicates | POST | تنظيف المطابقات المكررة | - | { success, removed } |
| /api/admin/matches/history | GET | سجل المطابقات | page?, limit? | { success, data } |
5. إدارة طلبات التواصل
| المسار | الطريقة | الوصف | المعلمات المطلوبة | الاستجابة |
|--------|--------|-------|-----------------|-----------|
| /api/admin/contact-requests | GET | كل طلبات التواصل | status?, page?, limit? | { success, data, count, total, totalPages, currentPage } |
| /api/admin/contact-requests/pending | GET | طلبات التواصل المعلقة | page?, limit? | { success, data, count, total, totalPages, currentPage } |
| /api/admin/contact-requests/:id/approve | PUT | موافقة على طلب تواصل | - | { success, data } |
| /api/admin/contact-requests/:id/reject | PUT | رفض طلب تواصل | - | { success, data } |
---
هيكل قواعد البيانات
جدول المستخدمين (Users)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| phoneNumber | String | رقم الهاتف (فريد) |
| password | String | كلمة المرور (مشفرة) |
| fullName | String | الاسم الكامل |
| email | String | البريد الإلكتروني (اختياري) |
| points | Number | رصيد النقاط |
| isBlocked | Boolean | حالة الحظر |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول المستمسكات (Documents)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| userId | ObjectId | معرّف المستخدم مالك الإعلان |
| type | String | نوع الإعلان (مفقود/موجود) |
| documentType | String | نوع المستمسك |
| ownerName | String | اسم صاحب المستمسك |
| governorate | String | المحافظة |
| description | String | وصف المستمسك |
| contactPhone | String | رقم هاتف للتواصل |
| status | String | حالة المستمسك |
| views | Number | عدد المشاهدات |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول صور المستمسكات (DocumentImages)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| documentId | ObjectId | معرّف المستمسك |
| imageUrl | String | رابط الصورة |
| createdAt | Date | تاريخ الإنشاء |
جدول طلبات التواصل (ContactRequests)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| documentId | ObjectId | معرّف المستمسك |
| requesterId | ObjectId | معرّف مقدم الطلب |
| message | String | رسالة الطلب |
| status | String | حالة الطلب |
| adminNote | String | ملاحظة المشرف |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول المطابقات (Matches)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| lostDocumentId | ObjectId | معرّف المستمسك المفقود |
| foundDocumentId | ObjectId | معرّف المستمسك الموجود |
| matchType | String | نوع المطابقة (آلي/يدوي) |
| status | String | حالة المطابقة |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول المكافآت (Rewards)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| title | String | عنوان المكافأة |
| description | String | وصف المكافأة |
| pointsRequired | Number | النقاط المطلوبة |
| isActive | Boolean | حالة النشاط |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول طلبات استبدال المكافآت (RewardRedemptions)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| userId | ObjectId | معرّف المستخدم |
| rewardId | ObjectId | معرّف المكافأة |
| status | String | حالة الطلب |
| pointsUsed | Number | النقاط المستخدمة |
| adminNote | String | ملاحظة المشرف |
| createdAt | Date | تاريخ الإنشاء |
| updatedAt | Date | تاريخ التحديث |
جدول الإشعارات (Notifications)
| الحقل | النوع | الوصف |
|-------|------|-------|
| id | ObjectId | المعرّف الفريد |
| userId | ObjectId | معرّف المستخدم |
| title | String | عنوان الإشعار |
| message | String | نص الإشعار |
| type | String | نوع الإشعار |
| referenceId | ObjectId | معرّف الكائن المرتبط |
| isRead | Boolean | حالة القراءة |
| createdAt | Date | تاريخ الإنشاء |
---
نظام المطابقة الآلي
آلية عمل المطابقة
تسجيل المستمسكات:
عند إضافة مستمسك جديد (مفقود أو موجود)، يتم تسجيله في قاعدة البيانات
البحث عن المطابقات:
عند إضافة مستمسك مفقود، يبحث النظام عن المستمسكات الموجودة المطابقة
عند إضافة مستمسك موجود، يبحث النظام عن المستمسكات المفقودة المطابقة
معايير المطابقة:
تطابق نوع المستمسك (جواز سفر، هوية، إلخ)
تشابه اسم صاحب المستمسك (باستخدام خوارزميات تشابه النص)
توافق المحافظة
تقارب التواريخ (تاريخ الفقدان وتاريخ العثور)
4. المطابقة اليدوية:
يمكن للمشرفين إنشاء مطابقات يدوياً عند اكتشافها
إشعارات المطابقة:
عند وجود مطابقة، يتم إشعار أصحاب المستمسكات ذات الصلة
يتم أيضاً إشعار المشرفين للمراجعة
خوارزمية المطابقة
// خوارزمية المطابقة المقترحة (مثال توضيحي)
function findMatches(document) {
  // تحديد نوع المستمسكات المراد البحث عنها
  const searchType = document.type === 'lost' ? 'found' : 'lost';
  
  // بناء استعلام البحث
  const query = {
    type: searchType,
    documentType: document.documentType,
    governorate: document.governorate,
    status: 'approved'
  };
  
  // تنفيذ البحث
  const potentialMatches = db.documents.find(query);
  
  // تصفية النتائج باستخدام مقياس التشابه
  return potentialMatches.filter(match => {
    // حساب درجة تشابه الاسم
    const nameScore = calculateStringSimilarity(document.ownerName, match.ownerName);
    
    // حساب الفرق الزمني
    const dateDiff = Math.abs(document.createdAt - match.createdAt) / (24 * 60 * 60 * 1000); // بالأيام
    
    // مقياس التشابه الإجمالي
    return nameScore > 0.7 && dateDiff < 30; // مثال: 70% تشابه في الاسم، وفرق زمني أقل من 30 يوم
  });
}
---
نظام النقاط والمكافآت
آلية كسب النقاط
المساعدة في العثور على مستمسكات:
عندما يؤكد المستخدم التواصل مع صاحب مستمسك مفقود (50 نقطة)
عند تأكيد استلام المستمسك المفقود (100 نقطة إضافية)
نشاط المستخدم:
إنشاء إعلان جديد (10 نقاط)
الإبلاغ عن إعلانات غير مناسبة (5 نقاط إذا كان التقرير صحيحاً)
مكافآت المشاركة:
مكافأة المستخدمين النشطين شهرياً (25 نقطة)
المكافآت المقترحة
1. قسائم شراء إلكترونية:
قسيمة بقيمة 5 دولار (500 نقطة)
قسيمة بقيمة 10 دولار (900 نقطة)
بطاقات رصيد للهاتف:
رصيد بقيمة 5 دولار (450 نقطة)
رصيد بقيمة 10 دولار (850 نقطة)
خدمات مميزة في التطبيق:
إظهار إعلان في الصفحة الرئيسية لمدة يوم (200 نقطة)
ترقية حساب إلى "مساعد ذهبي" (1000 نقطة)
---
نظام الإشعارات
أنواع الإشعارات
إشعارات المستمسكات:
الموافقة على إعلان جديد
رفض إعلان
وجود مطابقة محتملة
إشعارات التواصل:
طلب تواصل جديد
الموافقة على طلب تواصل
رفض طلب تواصل
إشعارات المكافآت:
كسب نقاط جديدة
إتمام استبدال مكافأة
آليات توصيل الإشعارات
إشعارات داخل التطبيق:
يتم تخزينها في قاعدة البيانات
يعرضها التطبيق في قسم الإشعارات
إشعارات الدفع (Push Notifications):
إشعارات Firebase للأجهزة المحمولة
تصل للمستخدم حتى عند عدم فتح التطبيق
رسائل SMS:
للإشعارات المهمة (المطابقات، الموافقة على طلبات التواصل)
استخدام خدمة مثل Twilio
---
مخطط سير العمل
مسار الإعلان عن مستمسك مفقود
المستخدم يسجل الدخول للتطبيق
يضيف إعلان عن مستمسك مفقود مع البيانات المطلوبة
يرفع صورة للمستمسك (اختياري)
النظام يحفظ الإعلان بحالة "معلق"
المشرف يراجع الإعلان
عند الموافقة، تظهر في قائمة المستمسكات المفقودة
النظام يبحث عن مطابقات محتملة
في حالة وجود مطابقة، يتم إخطار المستخدم والمشرف
مسار العثور على مستمسك
المستخدم يشاهد إعلان عن مستمسك مفقود
يقدم طلب للتواصل مع صاحب الإعلان
المشرف يراجع الطلب
عند الموافقة، يتم إبلاغ صاحب المستمسك
يتواصل الطرفان لترتيب تسليم المستمسك
بعد التسليم، يؤكد صاحب المستمسك استلامه
النظام يكافئ الشخص الذي عثر على المستمسك
يتم تحديث حالة المستمسك إلى "تم التسليم"
---
نصائح للتنفيذ
1. البنية التقنية المقترحة
الخلفية (Backend):
Node.js مع Express.js
MongoDB (مع Mongoose)
JSON Web Tokens (JWT) للمصادقة
Multer لتحميل الصور
خدمة Firebase للإشعارات
Twilio لإرسال OTP ورسائل SMS
الواجهة (Frontend):
React Native للتطبيق الجوال
React.js مع Material-UI للوحة التحكم
Redux/Context API لإدارة الحالة
Axios للتعامل مع الطلبات
2. استراتيجية الأمان
تشفير كلمات المرور باستخدام bcrypt
استخدام JWT مع مدة صلاحية معقولة
التحقق من المدخلات وتنظيفها
الحماية من هجمات XSS و CSRF
تنفيذ آلية حماية من محاولات تخمين OTP (rate limiting)
3. خطوات التنفيذ المقترحة
المرحلة الأولى:
إعداد البنية الأساسية للمشروع
تنفيذ نظام المصادقة
إنشاء واجهات المستمسكات الأساسية
المرحلة الثانية:
تنفيذ نظام المطابقة
إضافة واجهات البحث والتصفية
تطوير لوحة تحكم المشرف
المرحلة الثالثة:
إضافة نظام النقاط والمكافآت
تطوير نظام الإشعارات
الاختبار والتحسين
4. اعتبارات التوسع
تصميم البنية التحتية للتعامل مع عدد متزايد من المستخدمين
استخدام Redis للتخزين المؤقت وتحسين الأداء
تنفيذ التحليلات لتتبع سلوك المستخدم وتحسين التجربة
خطة للنسخ الاحتياطي واستعادة البيانات
---