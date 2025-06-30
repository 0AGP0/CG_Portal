"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { logger } from '@/utils/logger';

export default function Login() {
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'advisor' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  
  // Kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (isAuthenticated && user) {
      logger.info('Kullanıcı zaten giriş yapmış, yönlendiriliyor:', user);
      const redirectPath = user.role === 'admin' ? '/admin' : 
                          user.role === 'advisor' ? '/advisor/dashboard' : 
                          '/dashboard';
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setToast({
        show: true,
        message: 'E-posta adresi gereklidir.',
        type: 'error'
      });
      return;
    }
    
    if ((role === 'advisor' || role === 'admin') && !password) {
      setToast({
        show: true,
        message: `${role === 'advisor' ? 'Danışman' : 'Admin'} girişi için şifre gereklidir.`,
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info('Giriş başlatılıyor:', { email, role });
      
      const success = await login(email, password, role);
      
      if (success) {
        logger.info('Giriş başarılı');
        setToast({
          show: true,
          message: 'Giriş başarılı! Yönlendiriliyorsunuz...',
          type: 'success'
        });
      } else {
        throw new Error('Giriş başarısız');
      }
    } catch (error) {
      logger.error('Giriş hatası:', error);
      setToast({
        show: true,
        message: error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col md:flex-row items-center justify-center gap-8 py-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center md:text-left mb-6">
            <h1 className="text-3xl font-bold text-[#002757] mb-2">Hoş Geldiniz</h1>
            <p className="text-gray-600 dark:text-gray-400">Yurt dışı eğitim sürecinizi yönetmeye başlayın</p>
          </div>
          
          <div className="hidden md:block">
            <div className="relative mt-8">
              <div className="absolute -z-10 -left-6 -top-6 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-xl"></div>
              <div className="absolute -z-10 -right-6 -bottom-6 w-32 h-32 bg-accent-100 dark:bg-accent-900/30 rounded-full blur-xl"></div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/60 dark:border-gray-700/30 rounded-xl p-6 shadow-xl">
                <h3 className="font-bold text-lg mb-3 text-[#002757]">Campus Global ile:</h3>
                <ul className="space-y-3">
                  {[
                    "Tüm başvuru süreçlerinizi tek yerden yönetin",
                    "Dokümanlarınızı güvenle saklayın ve paylaşın",
                    "Danışmanınızla anlık iletişim kurun",
                    "Başvuru durumunuzu canlı olarak takip edin",
                    "Vize sürecinizi adım adım izleyin"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200/60 dark:border-gray-700/30 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg rotate-6 opacity-80"></div>
                <div className="relative z-10 text-white font-bold text-xl">CG</div>
              </div>
              <span className="font-bold text-xl text-[#002757] dark:text-white">
                Campus<span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Global</span>
              </span>
            </div>
            
            {toast && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 mb-6 rounded-lg flex items-start gap-3 ${
                  toast.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800/30 dark:text-green-300' 
                    : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800/30 dark:text-red-300'
                }`}
              >
                <span className="text-lg mt-0.5">
                  {toast.type === 'success' ? '✓' : '⚠'}
                </span>
                <p className="text-sm">{toast.message}</p>
              </motion.div>
            )}
            
            <form onSubmit={handleSignIn}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#002757] dark:text-gray-300 mb-1">
                    Giriş yapmak istediğiniz alan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', label: 'Öğrenci' },
                      { id: 'advisor', label: 'Danışman' },
                      { id: 'admin', label: 'Admin' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setRole(option.id as 'student' | 'advisor' | 'admin')}
                        className={`relative p-3 border rounded-lg transition-all ${
                          role === option.id 
                            ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/30 dark:border-primary-700' 
                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          role === option.id 
                            ? 'text-primary-700 dark:text-primary-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </span>
                        {role === option.id && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#002757] dark:text-gray-300 mb-1">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                      required
                    />
                  </div>
                </div>
                
                {/* Danışman ve Admin girişi için şifre alanı */}
                {(role === 'advisor' || role === 'admin') && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#002757] dark:text-gray-300 mb-1">
                      Şifre <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>İşleniyor...</span>
                    </div>
                  ) : (
                    role === 'student' ? 'Giriş Bağlantısı Al' : role === 'admin' ? 'Admin Girişi' : 'Danışman Girişi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 