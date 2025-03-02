'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // إذا كان المستخدم مسجل دخوله، وجهه إلى لوحة التحكم
    if (status === 'authenticated') {
      router.push('/dashboard');
    } 
    // إذا كان غير مسجل دخوله أو حالة الجلسة غير معروفة، وجهه إلى تسجيل الدخول
    else if (status === 'unauthenticated') {
      router.push('/login');
    }
    // إذا كانت الحالة 'loading'، الانتظار حتى تنتهي
  }, [status, router]);

  // عرض شاشة تحميل بسيطة أثناء فحص حالة الجلسة
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-xl">جاري التحميل...</p>
      </div>
    </div>
  );
}
