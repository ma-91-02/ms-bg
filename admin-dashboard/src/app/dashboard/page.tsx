'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";

export default function Dashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // دالة لجلب البيانات من الـ API
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          setData(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">مرحباً، {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">البيانات</h2>
            
            {loading ? (
              <p>جاري تحميل البيانات...</p>
            ) : data.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded shadow">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>لا توجد بيانات متاحة</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 