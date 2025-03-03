'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // التحقق من الجلسة على جانب العميل
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  return <>{children}</>;
} 