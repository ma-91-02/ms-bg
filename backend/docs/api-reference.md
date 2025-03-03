# مرجع واجهة برمجة التطبيقات (API)

هذا المستند يوضح بالتفصيل جميع نقاط النهاية المتاحة في واجهة برمجة التطبيقات، مع أمثلة للطلبات والاستجابات.

## ملخص API

يستخدم النظام واجهة برمجة تطبيقات RESTful على المنفذ 3001. جميع البيانات يتم إرسالها واستلامها بتنسيق JSON.

**URL الأساسي**: `http://localhost:3001` (تطوير) أو `https://api.yourservice.com` (إنتاج)

## المصادقة

### مصادقة المستخدم

#### إرسال رمز OTP

**POST** `/api/auth/send-otp`

**المعلمات**:

- `phoneNumber`: رقم الهاتف بتنسيق الدولة (مثل `+201012345678`)

**استجابة ناجحة** (200):

json
{
"success": true,
"message": "تم إرسال رمز التحقق"
}

#### التحقق من رمز OTP
POST /api/mobile/auth/verify-otp


**طلب**:

json
{
"phoneNumber": "+9647XXXXXXXXX",
"otp": "123456"
}

**استجابة ناجحة** (200):
json
{
"success": true,
"message": "تم تسجيل الدخول بنجاح",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"isProfileComplete": false,
"user": {
"id": "60d21b4667d0d8992e610c85",
"phoneNumber": "+9647XXXXXXXXX",
"name": ""
}
}

### مصادقة المسؤول
POST /api/login

**طلب**:
json
{
"username": "admin",
"password": "password123"
}

**استجابة ناجحة** (200):
json
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

## إدارة التقارير

### إنشاء تقرير جديد

POST /api/mobile/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data

**طلب**:
title: "هوية مفقودة"
description: "فقدت هويتي الشخصية في منطقة الكرادة"
type: "lost"
category: "documents"
location: { "lat": 33.315241, "lng": 44.366145 }
date: "2023-10-15"
documentType: "هوية شخصية"
documentId: "12345678"
images: [ملف1.jpg, ملف2.jpg]

**استجابة ناجحة** (201):

json
{
"success": true,
"message": "تم إنشاء التقرير بنجاح",
"report": {
"id": "60d21b4667d0d8992e610c85",
"title": "هوية مفقودة",
"status": "pending",
"createdAt": "2023-10-20T10:30:15.123Z"
}
}

### البحث عن التقارير
GET /api/mobile/reports/search?type=lost&category=documents&query=هوية
Authorization: Bearer {token}

**استجابة ناجحة** (200):
json
{
"success": true,
"results": [
{
"id": "60d21b4667d0d8992e610c85",
"title": "هوية مفقودة",
"description": "فقدت هويتي الشخصية في منطقة الكرادة",
"type": "lost",
"category": "documents",
"images": ["url/to/image1.jpg"],
"location": { "lat": 33.315241, "lng": 44.366145 },
"date": "2023-10-15",
"status": "approved",
"createdAt": "2023-10-20T10:30:15.123Z"
}
],
"total": 1,
"page": 1,
"limit": 10
}

### واجهة API للمسؤولين

توثيق كامل لواجهة API للمسؤولين متاح عبر Swagger UI على `/api-docs` بعد تسجيل الدخول كمسؤول.

## رموز الحالة

- `200 OK`: تم تنفيذ الطلب بنجاح
- `201 Created`: تم إنشاء المورد بنجاح
- `400 Bad Request`: تنسيق طلب غير صالح
- `401 Unauthorized`: المصادقة مطلوبة
- `403 Forbidden`: المستخدم غير مصرح له بالوصول
- `404 Not Found`: المورد غير موجود
- `500 Internal Server Error`: حدث خطأ في الخادم

## حدود الاستخدام

- الحد الأقصى لحجم الرفع: 5MB لكل ملف
- الحد الأقصى لعدد الصور لكل تقرير: 5 صور
- الحد الأقصى لعدد الطلبات: 100 طلب/دقيقة لكل مستخدم