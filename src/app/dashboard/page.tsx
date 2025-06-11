"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useData';
import { useNotifications } from '@/context/NotificationContext';

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
  const { dashboardNotifications } = useNotifications();
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
    university: studentData.x_studio_niversite_ad || "Henüz Belirlenmedi",
    program: studentData.x_studio_niversite_blm_ad || "Henüz Belirlenmedi",
    studentId: studentData.x_studio_pasaport_numaras || "Henüz Belirlenmedi",
    counselor: studentData.advisor_name || "Henüz Atanmadı",
    salesPerson: studentData.sales_person_name || "Henüz Atanmadı",
    lastLogin: studentData.updated_at ? new Date(studentData.updated_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
    phone: studentData.phone || "-",
    languageLevel: studentData.x_studio_almanca_seviyesi_1 || "-",
    alerts: [
      // Süreç durumu bildirimi
      {
        id: 1,
        type: studentData.stage === 'BİTEN' ? 'success' : 'info',
        message: studentData.stage === 'BİTEN' 
          ? 'Başvuru süreciniz tamamlandı!'
          : `Başvuru süreciniz ${studentData.stage || 'başlatıldı'} aşamasında.`
      },
      // Belge bildirimi
      ...(studentData.documents?.length === 0 ? [{
        id: 2,
        type: 'warning',
        message: 'Henüz belge yüklenmemiş. Lütfen gerekli belgeleri yükleyin.'
      }] : []),
      // Vize bildirimi
      ...(studentData.x_studio_vize_randevu_tarihi ? [{
        id: 3,
        type: 'info',
        message: `Vize randevunuz: ${new Date(studentData.x_studio_vize_randevu_tarihi).toLocaleDateString('tr-TR')}`
      }] : [{
        id: 3,
        type: 'warning',
        message: 'Henüz vize randevunuz bulunmuyor.'
      }])
    ]
  } : null;
  
  // Saat bazlı selamlaşma
  const hour = currentTime.getHours();
  let greeting = "İyi Günler";
  if (hour < 6) greeting = "İyi Geceler";
  else if (hour < 12) greeting = "Günaydın";
  else if (hour < 18) greeting = "İyi Günler";
  else greeting = "İyi Akşamlar";

  // Aşama tipleri ve ilerleme hesaplama
  const stageMapping: Record<string, number> = {
    'Hazırlık Aşaması': 1,
    'Çeviri Hazır': 2,
    'Üniversite Başvurusu Yapıldı': 3,
    'Kabul Geldi': 4,
    'Vize Başvuru Aşaması': 5,
    'Süreç Aşaması': 6,
    'Vize Randevusu Atandı': 7,
    'Vize Bekleme Aşaması': 8,
    'Almanya Aşaması': 9,
    'Süreç Tamamlandı': 10
  };

  // Aşama normalizasyonu
  const normalizeStage = (stage: string | undefined): string => {
    if (!stage) return 'Hazırlık Aşaması';
    
    switch (stage) {
      case 'Ceviri Hazir': return 'Çeviri Hazır';
      case 'Üniversite Başvurusu Yapılanlar': return 'Üniversite Başvurusu Yapıldı';
      case 'Kabul Gelenler': return 'Kabul Geldi';
      case 'Vize Randevusu Atananlar': return 'Vize Randevusu Atandı';
      case 'BİTEN': return 'Süreç Tamamlandı';
      default: return stage;
    }
  };

  // İlerleme yüzdesini hesapla
  const calculateProgress = (stage: string | undefined): number => {
    const normalizedStage = normalizeStage(stage);
    const stageNumber = stageMapping[normalizedStage] || 1;
    return Math.round((stageNumber / 10) * 100);
  };

  // Aşama ikonları için SVG bileşenleri
  const StageIcons = {
    Preparation: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Translation: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 3H9C7.05 8.84 7.05 15.16 9 21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 3C16.95 8.84 16.95 15.16 15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 9C8.84 7.05 15.16 7.05 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    University: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11V17L12 19L15 17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 10V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Acceptance: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Visa: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Process: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Appointment: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Waiting: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Germany: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Completed: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  // Aşama ikonlarını ve etiketlerini tanımla
  const stageIcons = [
    { 
      label: 'Hazırlık', 
      icon: StageIcons.Preparation,
      stage: 'Hazırlık Aşaması',
      shortLabel: 'Hazırlık'
    },
    { 
      label: 'Çeviri', 
      icon: StageIcons.Translation,
      stage: 'Çeviri Hazır',
      shortLabel: 'Çeviri'
    },
    { 
      label: 'Üniversite', 
      icon: StageIcons.University,
      stage: 'Üniversite Başvurusu Yapıldı',
      shortLabel: 'Başvuru'
    },
    { 
      label: 'Kabul', 
      icon: StageIcons.Acceptance,
      stage: 'Kabul Geldi',
      shortLabel: 'Kabul'
    },
    { 
      label: 'Vize Başvuru', 
      icon: StageIcons.Visa,
      stage: 'Vize Başvuru Aşaması',
      shortLabel: 'Vize'
    },
    { 
      label: 'Süreç', 
      icon: StageIcons.Process,
      stage: 'Süreç Aşaması',
      shortLabel: 'Süreç'
    },
    { 
      label: 'Randevu', 
      icon: StageIcons.Appointment,
      stage: 'Vize Randevusu Atandı',
      shortLabel: 'Randevu'
    },
    { 
      label: 'Bekleme', 
      icon: StageIcons.Waiting,
      stage: 'Vize Bekleme Aşaması',
      shortLabel: 'Bekleme'
    },
    { 
      label: 'Almanya', 
      icon: StageIcons.Germany,
      stage: 'Almanya Aşaması',
      shortLabel: 'Almanya'
    },
    { 
      label: 'Tamamlandı', 
      icon: StageIcons.Completed,
      stage: 'Süreç Tamamlandı',
      shortLabel: 'Bitti'
    }
  ];

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

        {/* Ana İçerik */}
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Taraf - Süreç Durumu ve Kişisel Bilgiler Özeti */}
            <div className="lg:col-span-2 space-y-6">
              {/* Süreç Durumu */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Süreç Durumu</h3>
                
                {/* Süreç Aşamaları */}
                <div className="relative">
                  {/* Progress Bar */}
              <div className="relative pt-2">
                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                        style={{ width: `${calculateProgress(studentData?.stage)}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                  ></div>
                </div>
                    
                    {/* Aşama Noktaları */}
                    <div className="flex justify-between mt-4 px-2">
                      {stageIcons.map((stage, index) => {
                        const currentStage = normalizeStage(studentData?.stage);
                        const stageNumber = stageMapping[currentStage] || 1;
                        const isCompleted = stageMapping[stage.stage] <= stageNumber;
                        const isCurrentStage = stage.stage === currentStage;
                        
                        return (
                          <div key={index} className="flex flex-col items-center relative group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                              ${isCompleted 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                : isCurrentStage
                                ? 'bg-accent-500 text-white ring-2 ring-accent-300 shadow-lg shadow-accent-500/20'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'}`}>
                              <stage.icon />
                            </div>
                            <span className="text-[10px] font-medium mt-2 text-gray-600 dark:text-gray-400 text-center">
                              {stage.shortLabel}
                            </span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg">
                              {stage.label}
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Mevcut Aşama Bilgisi */}
                  {studentData?.stage && (
                    <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-300 text-lg">
                              {normalizeStage(studentData.stage) === 'Süreç Tamamlandı' ? '🎉' : '📌'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-primary-800 dark:text-primary-200">
                            Mevcut Aşama: {normalizeStage(studentData.stage)}
                          </h4>
                          <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                            İlerleme: %{calculateProgress(studentData.stage)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
                  {/* Süreç Detayları Linki */}
                  <div className="mt-4">
                    <Link 
                      href="/dashboard/process" 
                      className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      <span>Süreç Detaylarını Görüntüle</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    </Link>
                  </div>
                </div>
              </div>
                
              {/* Kişisel Bilgiler Özeti */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kişisel Bilgiler Özeti</h3>
                  <Link 
                    href="/dashboard/education" 
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    Tümünü Görüntüle
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Temel Bilgiler */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ad Soyad</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Üniversite</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.university}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bölüm</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.program}</p>
                    </div>
                    </div>
                    </div>
                  
                  {/* İletişim ve Belge Bilgileri */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Telefon</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.phone}</p>
                    </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pasaport No</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.studentId}</p>
                    </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                    </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Almanca Seviyesi</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{userData?.languageLevel}</p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sağ Taraf - Hızlı Erişim ve Bildirimler */}
            <div className="space-y-6">
              {/* Hızlı Erişim */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Hızlı Erişim</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href="/dashboard/education" 
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
        </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Kişisel Bilgiler</span>
                  </Link>
                  
                  <Link 
                    href="/dashboard/visa" 
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg hover:from-secondary-50 hover:to-secondary-100 dark:hover:from-secondary-900/20 dark:hover:to-secondary-800/20 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">Vize İşlemleri</span>
            </Link>
                  
                  <Link 
                    href="/dashboard/messages" 
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/20 dark:hover:to-accent-800/20 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-accent-600 dark:text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">Mesajlar</span>
            </Link>
                  
                  <Link 
                    href="/dashboard/documents" 
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-lg hover:from-success-50 hover:to-success-100 dark:hover:from-success-900/20 dark:hover:to-success-800/20 transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-success-600 dark:text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors">Belgeler</span>
                  </Link>
                </div>
              </div>
              
              {/* Bildirimler */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Bildirimler</h3>
                <div className="space-y-4">
                  {userData?.alerts?.map((alert: any) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                          : alert.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {alert.type === 'warning' ? (
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : alert.type === 'success' ? (
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{alert.message}</p>
                        </div>
                  </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 