"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setToast({
        show: true,
        message: 'Lütfen e-posta adresinizi girin.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    setIsLoading(true);
    
    // Burada NextAuth.js entegrasyonu gelecek
    // Şimdilik sadece başarılı bir giriş simülasyonu yapıyoruz
    setTimeout(() => {
      setToast({
        show: true,
        message: `${email} adresine giriş linki gönderdik. Lütfen e-postanızı kontrol edin.`,
        type: 'success'
      });
      setIsLoading(false);
      setTimeout(() => setToast(null), 5000);
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-full max-w-md p-8 border border-gray-200 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Campus Global Portal</h1>
            <p className="text-default">Hesabınıza giriş yapın</p>
          </div>
          
          {toast && (
            <div className={`p-3 mb-4 rounded ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {toast.message}
            </div>
          )}
          
          <form onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#002757] mb-1">
                  E-posta Adresi <span className="text-red-500">*</span>
                </label>
                <input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Gönderiliyor...' : 'Giriş Bağlantısı Al'}
              </button>
              
              <p className="text-center mt-4">
                Hesabınız yok mu?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Kayıt Olun
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 