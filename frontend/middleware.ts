import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // تجاهل مسارات API ومسارات الموارد الثابتة
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.startsWith('/favicon.ico') ||
    path.includes('.') // ملفات مثل .js, .css, إلخ
  ) {
    return NextResponse.next();
  }
  
  // تخطي التحقق لصفحة تسجيل الدخول
  if (path === '/login') {
    return NextResponse.next();
  }
  
  // التحقق من توكن المستخدم
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // إذا لم يكن هناك توكن، توجيه المستخدم إلى صفحة تسجيل الدخول
  if (!token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // إذا كان هناك توكن ومحاولة الوصول إلى صفحة تسجيل الدخول
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// تطبيق الـ Middleware على جميع المسارات
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 