"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'advisor' | 'sales'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

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
    
    if ((role === 'advisor' || role === 'sales') && !password) {
      setToast({
        show: true,
        message: `${role === 'advisor' ? 'Danışman' : 'Satış Ekibi'} girişi için şifre gereklidir.`,
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Giriş işlemi
      const success = await login(email, password, role);
      
      if (success) {
        // Başarılı giriş - kullanıcının rolüne göre yönlendirme yap
        if (role === 'advisor') {
          // Danışman dashboard'a yönlendir
          router.push('/advisor/dashboard');
        } else if (role === 'sales') {
          // Satış ekibi dashboard'a yönlendir
          router.push('/sales/dashboard');
        } else {
          // Öğrenci dashboard'a yönlendir
          router.push('/dashboard');
        }
      } else {
        setToast({
          show: true,
          message: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
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
              {/* Rol seçimi */}
              <div className="grid grid-cols-3 mb-4 gap-2">
                <div 
                  className={`p-3 border rounded-md cursor-pointer text-center ${role === 'student' ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}
                  onClick={() => setRole('student')}
                >
                  <span>Öğrenci</span>
                </div>
                <div 
                  className={`p-3 border rounded-md cursor-pointer text-center ${role === 'advisor' ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}
                  onClick={() => setRole('advisor')}
                >
                  <span>Danışman</span>
                </div>
                <div 
                  className={`p-3 border rounded-md cursor-pointer text-center ${role === 'sales' ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}
                  onClick={() => setRole('sales')}
                >
                  <span>Satış Ekibi</span>
                </div>
              </div>

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
              
              {/* Danışman ve Satış Ekibi girişi için şifre alanı */}
              {(role === 'advisor' || role === 'sales') && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#002757] mb-1">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              
              <button
                type="submit"
                className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : role === 'student' ? 'Giriş Bağlantısı Al' : 'Giriş Yap'}
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