// قاموس المصطلحات لترجمة أنواع المستندات من الإنجليزية إلى العربية
export const documentTypeTranslations: Record<string, string> = {
  // أنواع المستندات
  'id': 'بطاقة هوية',
  'identity': 'بطاقة هوية',
  'national_id': 'بطاقة هوية وطنية',
  'id_card': 'بطاقة هوية',
  'passport': 'جواز سفر',
  'driver_license': 'رخصة قيادة',
  'driving_license': 'رخصة قيادة',
  'credit_card': 'بطاقة ائتمان',
  'debit_card': 'بطاقة مصرفية',
  'bank_card': 'بطاقة مصرفية',
  'atm_card': 'بطاقة صراف آلي',
  'student_id': 'بطاقة طالب',
  'employee_id': 'بطاقة موظف',
  'work_id': 'بطاقة عمل',
  'residence_card': 'بطاقة إقامة',
  'birth_certificate': 'شهادة ميلاد',
  'marriage_certificate': 'عقد زواج',
  'degree_certificate': 'شهادة دراسية',
  'diploma': 'شهادة دبلوم',
  'license': 'ترخيص',
  'car_license': 'رخصة سيارة',
  'vehicle_license': 'رخصة مركبة',
  'car_registration': 'استمارة سيارة',
  'health_card': 'بطاقة صحية',
  'insurance_card': 'بطاقة تأمين',
  'medical_card': 'بطاقة طبية',
  'military_id': 'بطاقة عسكرية',
  'residency': 'إقامة',
  'wallet': 'محفظة',
  'keys': 'مفاتيح',
  'documents': 'مستندات',
  'other': 'أخرى'
};

// قاموس المدن العراقية من الإنجليزية إلى العربية
export const cityTranslations: Record<string, string> = {
  // محافظات العراق
  'baghdad': 'بغداد',
  'basra': 'البصرة',
  'nineveh': 'نينوى',
  'mosul': 'الموصل',
  'erbil': 'أربيل',
  'sulaymaniyah': 'السليمانية',
  'dohuk': 'دهوك',
  'kirkuk': 'كركوك',
  'diyala': 'ديالى',
  'anbar': 'الأنبار',
  'karbala': 'كربلاء',
  'najaf': 'النجف',
  'babil': 'بابل',
  'wasit': 'واسط',
  'saladin': 'صلاح الدين',
  'muthanna': 'المثنى',
  'dhi_qar': 'ذي قار',
  'maysan': 'ميسان',
  'diwaniyah': 'الديوانية',
  'qadisiyah': 'القادسية',
  'halabja': 'حلبجة',
  // مدن أخرى
  'fallujah': 'الفلوجة',
  'ramadi': 'الرمادي',
  'samarra': 'سامراء',
  'tikrit': 'تكريت',
  'nasiriyah': 'الناصرية',
  'hillah': 'الحلة',
  'kut': 'الكوت',
  'amarah': 'العمارة',
  'kufa': 'الكوفة',
  'zakho': 'زاخو'
};

/**
 * ترجمة نوع المستند من الإنجليزية إلى العربية
 * @param type نوع المستند بالإنجليزية
 * @returns نوع المستند بالعربية
 */
export const translateDocumentType = (type: any): string => {
  // التحقق من وجود القيمة
  if (type === null || type === undefined) {
    return 'نوع غير محدد';
  }
  
  // التحقق إذا كان كائن
  if (typeof type === 'object') {
    // تسجيل الكائن للتصحيح
    console.warn('تم تمرير كائن لترجمة نوع المستند:', type);
    
    // محاولة استخراج قيمة من الكائن
    if (type.name) return type.name;
    if (type.title) return type.title;
    if (type.type) return translateDocumentType(type.type);
    
    return 'نوع غير محدد';
  }
  
  // التحقق إذا كان نوع المستند هو رابط
  if (typeof type === 'string' && type.startsWith('http')) {
    return 'مستند';
  }

  // محاولة ترجمة المصطلح المعطى
  try {
    const normalizedType = String(type).toLowerCase().trim();
    const translation = documentTypeTranslations[normalizedType];
    
    // إذا وجدنا ترجمة نعيدها، وإلا نعيد المصطلح الأصلي
    return translation || String(type);
  } catch (error) {
    console.error('خطأ في ترجمة نوع المستند:', error);
    return String(type);
  }
};

/**
 * ترجمة اسم المدينة/المحافظة من الإنجليزية إلى العربية
 * @param city اسم المدينة بالإنجليزية
 * @returns اسم المدينة بالعربية
 */
export const translateCity = (city: any): string => {
  // التحقق من وجود القيمة
  if (city === null || city === undefined) {
    return 'غير محدد';
  }
  
  // التحقق إذا كان كائن
  if (typeof city === 'object') {
    // تسجيل الكائن للتصحيح
    console.warn('تم تمرير كائن لترجمة اسم المدينة:', city);
    
    // محاولة استخراج قيمة من الكائن
    if (city.name) return city.name;
    if (city.governorate) return translateCity(city.governorate);
    if (city.city) return translateCity(city.city);
    
    return 'غير محدد';
  }
  
  // التحقق إذا كان النص يحتوي على أرقام أو رموز خاصة
  if (typeof city === 'string' && /[0-9!@#$%^&*(),.?":{}|<>]/.test(city)) {
    return city;
  }

  // محاولة ترجمة المصطلح المعطى
  try {
    const normalizedCity = String(city).toLowerCase().trim();
    const translation = cityTranslations[normalizedCity];
    
    // إذا وجدنا ترجمة نعيدها، وإلا نعيد المصطلح الأصلي
    return translation || String(city);
  } catch (error) {
    console.error('خطأ في ترجمة اسم المدينة:', error);
    return String(city);
  }
}; 