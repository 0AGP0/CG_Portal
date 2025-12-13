"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Kullanıcı giriş yapmışsa rolüne göre yönlendir
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'advisor') {
        router.push('/advisor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Giriş yapmamışsa login sayfasına yönlendir
      router.push('/login');
    }
  }, [user, router]);

  // Yönlendirme sırasında loading göster
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-200 opacity-40"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Yönlendiriliyor...</p>
      </div>
    </Layout>
  );
}
