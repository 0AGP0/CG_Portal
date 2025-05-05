"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      setToast({
        show: true,
        message: 'Lütfen ad, soyad ve e-posta alanlarını doldurun.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    setIsLoading(true);
    
    // Burada API entegrasyonu gelecek
    // Şimdilik sadece başarılı bir kayıt simülasyonu yapıyoruz
    setTimeout(() => {
      setToast({
        show: true,
        message: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
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
            <h1 className="text-2xl font-bold mb-2">Yeni Hesap Oluştur</h1>
            <p className="text-default">Campus Global Portal'a kayıt olun</p>
          </div>
          
          {toast && (
            <div className={`p-3 mb-4 rounded ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {toast.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#002757] mb-1">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input 
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ad Soyad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#002757] mb-1">
                  E-posta Adresi <span className="text-red-500">*</span>
                </label>
                <input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#002757] mb-1">
                  Telefon Numarası (İsteğe Bağlı)
                </label>
                <input 
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+90 555 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className={`w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
              
              <p className="text-center mt-4">
                Zaten hesabınız var mı?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 