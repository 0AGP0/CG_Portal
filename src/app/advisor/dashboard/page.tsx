"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudents } from '@/hooks/useData';
import { Search, MessageSquare, FileText, Calendar, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import type { Student } from '@/types/student';
import dynamic from 'next/dynamic';

const StudentDetailsModal = dynamic(() => import('@/components/StudentDetailsModal'), {
  ssr: false
});

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

// Aşama tanımlamaları
const STAGES = {
  HAZIRLIK_ASAMASI: 'Hazırlık Aşaması',
  CEVIRI_HAZIR: 'Çeviri Hazır',
  UNIVERSITE_BASVURUSU: 'Üniversite Başvurusu Yapıldı',
  KABUL_GELDI: 'Kabul Geldi',
  VIZE_BASVURU: 'Vize Başvuru Aşaması',
  SUREC_ASAMASI: 'Süreç Aşaması',
  VIZE_RANDEVU: 'Vize Randevusu Atandı',
  VIZE_BEKLEME: 'Vize Bekleme Aşaması',
  ALMANYA_ASAMASI: 'Almanya Aşaması',
  BITEN: 'Süreç Tamamlandı'
} as const;

// Aşama sıralaması
const STAGE_ORDER = [
  'HAZIRLIK_ASAMASI',
  'CEVIRI_HAZIR',
  'UNIVERSITE_BASVURUSU',
  'KABUL_GELDI',
  'VIZE_BASVURU',
  'SUREC_ASAMASI',
  'VIZE_RANDEVU',
  'VIZE_BEKLEME',
  'ALMANYA_ASAMASI',
  'BITEN'
] as const;

// Odoo'dan gelen aşama değerlerini bizim aşama değerlerimize eşleştirme
const STAGE_MAPPING: Record<string, typeof STAGE_ORDER[number]> = {
  // Odoo'dan gelen aşamalar -> Portal aşamaları
  'Hazırlık Aşaması': 'HAZIRLIK_ASAMASI',
  'Çeviri Hazır': 'CEVIRI_HAZIR',
  'Üniversite Başvurusu Yapılanlar': 'UNIVERSITE_BASVURUSU',
  'Kabul Gelenler': 'KABUL_GELDI',
  'Vize Başvuru Aşaması': 'VIZE_BASVURU',
  'Süreç Aşaması': 'SUREC_ASAMASI',
  'Vize Randevusu Atananlar': 'VIZE_RANDEVU',
  'Vize Bekleme Aşaması': 'VIZE_BEKLEME',
  'Almanya Aşaması': 'ALMANYA_ASAMASI',
  'BİTEN': 'BITEN',
  
  // Portal aşamaları (geriye dönük uyumluluk için)
  'HAZIRLIK_ASAMASI': 'HAZIRLIK_ASAMASI',
  'CEVIRI_HAZIR': 'CEVIRI_HAZIR',
  'UNIVERSITE_BASVURUSU': 'UNIVERSITE_BASVURUSU',
  'KABUL_GELDI': 'KABUL_GELDI',
  'VIZE_BASVURU': 'VIZE_BASVURU',
  'SUREC_ASAMASI': 'SUREC_ASAMASI',
  'VIZE_RANDEVU': 'VIZE_RANDEVU',
  'VIZE_BEKLEME': 'VIZE_BEKLEME',
  'ALMANYA_ASAMASI': 'ALMANYA_ASAMASI',
  'BITEN': 'BITEN',
  
  // Eski değerler (geriye dönük uyumluluk için)
  'Süreç Başlatıldı': 'HAZIRLIK_ASAMASI',
  'İşlemde': 'SUREC_ASAMASI',
  'biten': 'BITEN'
};

// Aşama renkleri ve ikonları
const STAGE_CONFIG: Record<string, {
  color: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  label: string;
}> = {
  HAZIRLIK_ASAMASI: {
    color: 'text-blue-600 dark:text-blue-400',
    icon: '📝',
    bgColor: 'bg-blue-50/50 dark:bg-blue-900/20',
    borderColor: 'border-blue-100/60 dark:border-blue-800/30',
    iconBgColor: 'bg-blue-100 dark:bg-blue-800',
    label: 'Hazırlık Aşaması'
  },
  CEVIRI_HAZIR: {
    color: 'text-indigo-600 dark:text-indigo-400',
    icon: '📚',
    bgColor: 'bg-indigo-50/50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-100/60 dark:border-indigo-800/30',
    iconBgColor: 'bg-indigo-100 dark:bg-indigo-800',
    label: 'Çeviri Hazır'
  },
  UNIVERSITE_BASVURUSU: {
    color: 'text-primary-600 dark:text-primary-400',
    icon: '🎓',
    bgColor: 'bg-primary-50/50 dark:bg-primary-900/20',
    borderColor: 'border-primary-100/60 dark:border-primary-800/30',
    iconBgColor: 'bg-primary-100 dark:bg-primary-800',
    label: 'Üniversite Başvurusu Yapıldı'
  },
  KABUL_GELDI: {
    color: 'text-success-600 dark:text-success-400',
    icon: '✅',
    bgColor: 'bg-success-50/50 dark:bg-success-900/20',
    borderColor: 'border-success-100/60 dark:border-success-800/30',
    iconBgColor: 'bg-success-100 dark:bg-success-800',
    label: 'Kabul Geldi'
  },
  VIZE_BASVURU: {
    color: 'text-accent-600 dark:text-accent-400',
    icon: '📋',
    bgColor: 'bg-accent-50/50 dark:bg-accent-900/20',
    borderColor: 'border-accent-100/60 dark:border-accent-800/30',
    iconBgColor: 'bg-accent-100 dark:bg-accent-800',
    label: 'Vize Başvuru Aşaması'
  },
  SUREC_ASAMASI: {
    color: 'text-secondary-600 dark:text-secondary-400',
    icon: '⚡',
    bgColor: 'bg-secondary-50/50 dark:bg-secondary-900/20',
    borderColor: 'border-secondary-100/60 dark:border-secondary-800/30',
    iconBgColor: 'bg-secondary-100 dark:bg-secondary-800',
    label: 'Süreç Aşaması'
  },
  VIZE_RANDEVU: {
    color: 'text-warning-600 dark:text-warning-400',
    icon: '📅',
    bgColor: 'bg-warning-50/50 dark:bg-warning-900/20',
    borderColor: 'border-warning-100/60 dark:border-warning-800/30',
    iconBgColor: 'bg-warning-100 dark:bg-warning-800',
    label: 'Vize Randevusu Atandı'
  },
  VIZE_BEKLEME: {
    color: 'text-purple-600 dark:text-purple-400',
    icon: '⏳',
    bgColor: 'bg-purple-50/50 dark:bg-purple-900/20',
    borderColor: 'border-purple-100/60 dark:border-purple-800/30',
    iconBgColor: 'bg-purple-100 dark:bg-purple-800',
    label: 'Vize Bekleme Aşaması'
  },
  ALMANYA_ASAMASI: {
    color: 'text-pink-600 dark:text-pink-400',
    icon: '✈️',
    bgColor: 'bg-pink-50/50 dark:bg-pink-900/20',
    borderColor: 'border-pink-100/60 dark:border-pink-800/30',
    iconBgColor: 'bg-pink-100 dark:bg-pink-800',
    label: 'Almanya Aşaması'
  },
  BITEN: {
    color: 'text-gray-600 dark:text-gray-400',
    icon: '🏁',
    bgColor: 'bg-gray-50/50 dark:bg-gray-800/50',
    borderColor: 'border-gray-100/60 dark:border-gray-700/30',
    iconBgColor: 'bg-gray-100 dark:bg-gray-700',
    label: 'Süreç Tamamlandı'
  }
};

export default function AdvisorDashboard() {
  const { user, isAdvisor } = useAuth();
  const router = useRouter();
  const { students, isLoading: isLoadingStudents } = useStudents();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeProcesses: 0,
    pendingDocuments: 0,
    upcomingAppointments: 0
  });

  // Erişim kontrolü - sadece danışmanlar erişebilir
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (!isAdvisor()) {
      router.push('/dashboard');
    }
  }, [user, isAdvisor, router]);

  // İstatistik verilerini hesapla
  useEffect(() => {
    if (students && students.length > 0) {
      const active = students.filter((s: Student) => s.processStarted).length;
      const pending = students.filter((s: Student) => (s.documents || []).length < 3).length;
      
      setStatsData({
        totalStudents: students.length,
        activeProcesses: active,
        pendingDocuments: pending,
        upcomingAppointments: students.filter((s: Student) => s.visa_appointment_date).length
      });
    }
    setIsLoading(false);
  }, [students]);

  // Öğrencileri aşamalara göre filtrele
  const getStudentsByStage = (stage: string) => {
    return students ? students.filter((student: Student) => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.university && student.university.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Öğrencinin stage değerini al ve normalize et
      const studentStage = student.stage || 'Hazırlık Aşaması';
      const normalizedStage = STAGE_MAPPING[studentStage] || 'HAZIRLIK_ASAMASI';
      
      // Debug için log
      console.log(`Öğrenci: ${student.name}, Orijinal Stage: ${studentStage}, Normalize Edilmiş Stage: ${normalizedStage}, Hedef Stage: ${stage}`);
      
      return matchesSearch && normalizedStage === stage;
    }) : [];
  };

  if (!user || isLoading || isLoadingStudents) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1920px] mx-auto px-4"
      >
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#002757] dark:text-blue-300">
            Öğrenciler
          </h1>
          <p className="text-sm lg:text-base text-default mt-1">
            Tüm öğrencilerinizi ve süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="card-blur p-4 lg:p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs lg:text-sm font-medium text-primary-600 dark:text-primary-400">Toplam Öğrenci</p>
                <p className="text-xl lg:text-2xl font-bold text-primary-700 dark:text-primary-300 mt-1">{statsData.totalStudents}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-primary-100/50 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-lg lg:text-2xl">👥</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="card-blur p-4 lg:p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs lg:text-sm font-medium text-success-600 dark:text-success-400">Aktif Süreçler</p>
                <p className="text-xl lg:text-2xl font-bold text-success-700 dark:text-success-300 mt-1">{statsData.activeProcesses}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-success-100/50 dark:bg-success-900/30 flex items-center justify-center">
                <span className="text-lg lg:text-2xl">📊</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="card-blur p-4 lg:p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs lg:text-sm font-medium text-warning-600 dark:text-warning-400">Bekleyen Belgeler</p>
                <p className="text-xl lg:text-2xl font-bold text-warning-700 dark:text-warning-300 mt-1">{statsData.pendingDocuments}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-warning-100/50 dark:bg-warning-900/30 flex items-center justify-center">
                <span className="text-lg lg:text-2xl">📄</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="card-blur p-4 lg:p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs lg:text-sm font-medium text-accent-600 dark:text-accent-400">Yaklaşan Randevular</p>
                <p className="text-xl lg:text-2xl font-bold text-accent-700 dark:text-accent-300 mt-1">{statsData.upcomingAppointments}</p>
              </div>
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-accent-100/50 dark:bg-accent-900/30 flex items-center justify-center">
                <span className="text-lg lg:text-2xl">📅</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Arama Kutusu */}
        <div className="mb-4 lg:mb-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="İsim, email veya üniversite ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 lg:py-3 pl-10 lg:pl-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm text-sm lg:text-base"
            />
            <div className="absolute left-3 lg:left-4 top-2.5 lg:top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aşama Sütunları - Desktop */}
        <div className="hidden lg:block relative w-full overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max px-1">
            {STAGE_ORDER.map((stage) => {
              const stageStudents = getStudentsByStage(stage);
              const config = STAGE_CONFIG[stage];
              
              return (
                <motion.div
                  key={stage}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className={`${config.bgColor} ${config.borderColor} rounded-xl border shadow-sm w-[400px] flex-shrink-0`}
                >
                  <div className="sticky top-0 z-10 p-4 border-b border-gray-100/60 dark:border-gray-700/30 bg-inherit backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#002757] dark:text-blue-300">
                            {STAGES[stage]}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stageStudents.length} öğrenci
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stageStudents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Bu aşamada öğrenci bulunmuyor
                      </p>
                    ) : (
                      stageStudents.map((student: Student) => (
                        <div
                          key={student.email}
                          className="card-blur rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                              {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {student.name}
                                </p>
                                {(student.unreadMessages ?? 0) > 0 && (
                                  <span className="bg-danger-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm ml-2 flex-shrink-0">
                                    {student.unreadMessages}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {student.email}
                              </p>
                              {student.university && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                  {student.university}
                                  {student.program && ` - ${student.program}`}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="flex-1 min-w-[80px] px-3 py-1.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-xs rounded-lg hover:from-secondary-600 hover:to-secondary-700 text-center font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                              Detaylar
                            </button>
                            <Link 
                              href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                              className="flex-1 min-w-[80px] px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-lg hover:from-primary-600 hover:to-primary-700 text-center font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                              Mesaj
                            </Link>
                            <Link 
                              href={`/advisor/documents?student=${encodeURIComponent(student.email || '')}`}
                              className="flex-1 min-w-[80px] px-3 py-1.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs rounded-lg hover:from-accent-600 hover:to-accent-700 text-center font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                              Belgeler
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobil Görünüm - Desktop Sütun Yapısı Slider */}
        <div className="lg:hidden">
          {/* Aşama Slider */}
          <div className="mb-6">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {STAGE_ORDER.map((stage) => {
                const stageStudents = getStudentsByStage(stage);
                const config = STAGE_CONFIG[stage];
                
                return (
                  <div
                    key={stage}
                    className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Aşama Başlığı */}
                    <div className={`${config.bgColor} ${config.borderColor} p-4 border-b`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
                            {config.icon}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${config.color} text-lg`}>
                              {STAGES[stage]}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {stageStudents.length} öğrenci
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Öğrenci Listesi */}
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {stageStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="text-sm">Bu aşamada öğrenci yok</p>
                        </div>
                      ) : (
                        stageStudents.map((student: Student) => (
                          <motion.div
                            key={student.email}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            {/* Öğrenci Bilgileri */}
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {student.name}
                                  </h4>
                                  {(student.unreadMessages ?? 0) > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                                      {student.unreadMessages}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {student.email}
                                </p>
                                {student.university && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {student.university}
                                    {student.program && ` • ${student.program}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Hızlı Aksiyonlar */}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>12</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span>5</span>
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Link 
                                  href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </Link>
                                
                                <Link 
                                  href={`/advisor/documents?student=${encodeURIComponent(student.email || '')}`}
                                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Öğrenci Detay Modalı */}
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </motion.div>
    </Layout>
  );
} 