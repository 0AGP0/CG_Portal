"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useData';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Dashboard() {
  const { user, startProcess, resetProcess } = useAuth();
  const { unreadCount } = useUnreadMessagesCount();
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Kullanıcı verilerini API'den çek
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const response = await fetch('/api/student/profile', {
            headers: {
              'x-user-email': user.email
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setStudentData(data.student);
          } else {
            // API'den veri gelmezse default gösterilecek veriler
            setStudentData({
              name: user.name,
              email: user.email,
              studentId: "Not Available",
              university: "Not Available",
              program: "Not Available",
              counselor: "Not Available",
              lastLogin: new Date().toLocaleDateString('tr-TR'),
              alerts: [
                { id: 1, type: 'warning', message: 'Profilinizi tamamlamanız gerekiyor.' }
              ]
            });
          }
        }
      } catch (error) {
        console.error('Kullanıcı verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Gün içinde selamlaşma metni için saati güncel tut
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [user]);
  
  if (!user || isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-200 opacity-40"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-600 animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </Layout>
    );
  }
  
  // Kullanıcı verileri
  const userData = studentData ? {
    name: studentData.name || user.name,
    email: studentData.email || user.email,
    // Profil resmi için kullanıcı adının baş harflerini al
    profileImage: `https://placehold.co/100x100/ffc105/002757?text=${(studentData.name || user.name).split(' ').map((n: string) => n[0]).join('')}`,
    university: studentData.university || "Henüz Belirlenmedi",
    program: studentData.program || "Henüz Belirlenmedi",
    studentId: studentData.studentId || "Henüz Belirlenmedi",
    counselor: studentData.counselor || "Henüz Atanmadı",
    salesPerson: studentData.salesPerson || "Henüz Atanmadı",
    lastLogin: studentData.lastLogin || new Date().toLocaleDateString('tr-TR'),
    alerts: studentData.alerts || [
      { id: 1, type: 'warning', message: 'Profilinizi tamamlamanız gerekiyor.' }
    ]
  } : null;
  
  // Saat bazlı selamlaşma
  const hour = currentTime.getHours();
  let greeting = "İyi Günler";
  if (hour < 6) greeting = "İyi Geceler";
  else if (hour < 12) greeting = "Günaydın";
  else if (hour < 18) greeting = "İyi Günler";
  else greeting = "İyi Akşamlar";

  return (
    <Layout>
      <div className="space-y-8">
        {/* Üst Bölüm - Karşılama ve Durum */}
        <div className="relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-40 h-40 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-xl"></div>
          
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white to-primary-50/70 dark:from-gray-800/80 dark:to-primary-900/20 border border-white/40 dark:border-gray-700/30 shadow-xl"
      >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[3px] group-hover:blur-[5px] transition-all"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800">
                    <img 
                      src={userData?.profileImage} 
                      alt={userData?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
          <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{greeting},</p>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    <span className="text-gray-800 dark:text-gray-100">{userData?.name}</span>
            </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    <span className="inline-flex items-center bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-md text-xs mr-2">
                      Öğrenci ID: {userData?.studentId}
                    </span>
                    Son giriş: {userData?.lastLogin}
                  </p>
                </div>
          </div>
          
              <div className="flex flex-wrap items-center gap-3">
            {user && user.processStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center px-4 py-2 bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 rounded-full gap-2"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-success-500 dark:bg-success-400"></span>
                    <span className="text-sm font-medium">Süreç Aktif</span>
              </motion.div>
            )}
            
                <Link href="/dashboard/messages">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mesajlar</span>
                    {unreadCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 dark:bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
              </motion.div>
                </Link>
              </div>
          </div>
          </motion.div>
        </div>

        {/* Uyarılar ve Bildirimler */}
        {userData?.alerts?.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Bildirimler
            </h2>
            
            {userData?.alerts?.map((alert: any) => (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border border-l-4 backdrop-blur-sm ${
                  alert.type === 'success' 
                    ? 'border-success-200 dark:border-success-900/30' 
                    : alert.type === 'warning' 
                      ? 'border-warning-200 dark:border-warning-900/30' 
                      : 'border-danger-200 dark:border-danger-900/30'
                }`}
              >
                <span className={`flex-shrink-0 rounded-full p-1.5 ${
                  alert.type === 'success' 
                    ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300' 
                    : alert.type === 'warning' 
                      ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300' 
                      : 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300'
                }`}>
                  {alert.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : alert.type === 'warning' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-700/30 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kişisel Bilgiler</h2>
              <Link href="/dashboard/education" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Detay Görüntüle
              </Link>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Üniversite</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userData?.university}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Program</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userData?.program}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Danışman</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userData?.counselor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satış Temsilcisi</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userData?.salesPerson}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-700/30 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Süreç Durumu</h2>
              <Link href="/dashboard/process" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Detay Görüntüle
              </Link>
            </div>
            <div className="p-5">
              <div className="relative pt-2">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    style={{ width: `${studentData?.systemDetails?.stagePercentage || 40}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 dark:bg-primary-600"
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>Başlangıç</span>
                  <span>Devam Ediyor</span>
                  <span>Tamamlandı</span>
                </div>
              </div>
              
              {/* Sistem güncellemesi bildirimi */}
              {studentData?.systemDetails?.isUpdated && (
                <div className="mt-3 mb-4 p-3 bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-300 rounded-lg text-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        Süreciniz güncellendi: <span className="font-bold">{studentData?.systemDetails?.stage}</span>
                      </p>
                      <p className="mt-1 text-xs opacity-80">
                        Son güncelleme: {studentData?.systemDetails?.lastUpdateTime || 'yakın zamanda'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Başvuru Formu Dolduruldu</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Danışman Atandı</p>
                  </div>
                </div>
                
                {/* Dinamik adım - gelen durum bilgisine göre */}
                <div className={`flex items-center ${studentData?.systemDetails?.stage === 'BİTEN' ? '' : 'opacity-70'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full 
                    ${studentData?.systemDetails?.stage === 'BİTEN' 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                      : 'bg-primary-100/50 dark:bg-primary-900/10 text-primary-400 dark:text-primary-500'} 
                    flex items-center justify-center mr-3`}>
                    {studentData?.systemDetails?.stage === 'BİTEN' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {studentData?.systemDetails?.stage === 'BİTEN' 
                        ? 'Süreç Tamamlandı' 
                        : 'Başvuru Dosyası Hazırlanıyor'}
                    </p>
                  </div>
                </div>
                
                {/* Vize adımı */}
                <div className={`flex items-center ${studentData?.systemDetails?.stage === 'BİTEN' ? '' : 'opacity-40'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full 
                    ${studentData?.systemDetails?.stage === 'BİTEN' 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'} 
                    flex items-center justify-center mr-3`}>
                    {studentData?.systemDetails?.stage === 'BİTEN' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs">4</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Vize Süreci</p>
                    {studentData?.visa?.appointmentDate && (
                      <p className="text-xs text-primary-600 dark:text-primary-400">
                        Randevu: {studentData.visa.appointmentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hızlı Erişim Kart Menüsü */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pt-4"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Hızlı Erişim</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
              <Link href="/dashboard/process" className="block h-full">
                <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-shadow p-5 group">
                  <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 inline-block mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Süreç Durumu</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Başvuru sürecinizi takip edin</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
              <Link href="/dashboard/visa" className="block h-full">
                <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-shadow p-5 group">
                  <div className="p-2 rounded-full bg-secondary-100 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400 inline-block mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">Vize Bilgileri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vize başvurunuzun durumu</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
              <Link href="/dashboard/documents" className="block h-full">
                <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-shadow p-5 group">
                  <div className="p-2 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400 inline-block mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">Dokümanlar</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Belgelerinizi yönetin</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
              <Link href="/dashboard/messages" className="block h-full">
                <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-shadow p-5 group">
                  <div className="p-2 rounded-full bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400 inline-block mb-3 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors">Mesajlar</h3>
                  {unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {unreadCount}
                      </span>
                    )}
                    </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Danışmanınızla iletişime geçin</p>
              </div>
            </Link>
          </motion.div>
          </div>
        </motion.div>

        {/* Kişisel Bilgiler Kartı */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden mt-6"
        >
          <div className="p-5 border-b border-gray-100 dark:border-gray-700/30 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kişisel Bilgiler</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              studentData?.systemDetails?.stage === 'BİTEN' 
                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300' 
                : 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300'
            }`}>
              {studentData?.systemDetails?.stage || 'Yeni'}
            </span>
          </div>
          <div className="p-5 space-y-4">
            {/* Pasaport Bilgileri */}
            {studentData?.passport?.number && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pasaport Bilgileri</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Pasaport No</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.number}</span>
                  </div>
                  {studentData?.passport?.type && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Pasaport Tipi</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.type}</span>
                    </div>
                  )}
                  {studentData?.passport?.issueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Veriliş Tarihi</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.issueDate}</span>
                    </div>
                  )}
                  {studentData?.passport?.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Geçerlilik Tarihi</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Vize Bilgileri */}
            {studentData?.visa?.appointmentDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vize Bilgileri</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                  {studentData?.visa?.applicationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Başvuru Tarihi</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.visa?.applicationDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Randevu Tarihi</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.visa?.appointmentDate}</span>
                  </div>
                  {studentData?.visa?.consulate && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Konsolosluk</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{studentData?.visa?.consulate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Son Güncelleme Bilgisi */}
            <div className="border-t border-gray-100 dark:border-gray-700/30 pt-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>Son güncelleme: {studentData?.systemDetails?.lastUpdated || 'Bilinmiyor'}</p>
              {studentData?.systemDetails?.isUpdated && (
                <p className="mt-1">
                  Otomatik güncelleme: {studentData.systemDetails.lastUpdateTime || 'yakın zamanda'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 