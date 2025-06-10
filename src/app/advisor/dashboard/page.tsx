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
  SUREC_BASLATILDI: 'Süreç Başlatıldı',
  ISLEMDE: 'İşlemde',
  VIZE_BASVURU: 'Vize Başvuru',
  VIZE_RANDEVU: 'Vize Randevu',
  VIZE_SONUC: 'Vize Sonuç',
  BITEN: 'BİTEN'
} as const;

// Aşama sıralaması
const STAGE_ORDER = [
  'SUREC_BASLATILDI',
  'ISLEMDE',
  'VIZE_BASVURU',
  'VIZE_RANDEVU',
  'VIZE_SONUC',
  'BITEN'
] as const;

// Aşama eşleştirme tablosu
const STAGE_MAPPING: Record<string, typeof STAGE_ORDER[number]> = {
  'Süreç Başlatıldı': 'SUREC_BASLATILDI',
  'İşlemde': 'ISLEMDE',
  'Vize Başvuru': 'VIZE_BASVURU',
  'Vize Randevu': 'VIZE_RANDEVU',
  'Vize Sonuç': 'VIZE_SONUC',
  'BİTEN': 'BITEN'
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
  SUREC_BASLATILDI: {
    color: 'text-blue-600 dark:text-blue-400',
    icon: '🚀',
    bgColor: 'bg-blue-50/50 dark:bg-blue-900/20',
    borderColor: 'border-blue-100/60 dark:border-blue-800/30',
    iconBgColor: 'bg-blue-100 dark:bg-blue-800',
    label: 'Süreç Başlatıldı'
  },
  ISLEMDE: {
    color: 'text-primary-600 dark:text-primary-400',
    icon: '⚡',
    bgColor: 'bg-primary-50/50 dark:bg-primary-900/20',
    borderColor: 'border-primary-100/60 dark:border-primary-800/30',
    iconBgColor: 'bg-primary-100 dark:bg-primary-800',
    label: 'İşlemde'
  },
  VIZE_BASVURU: {
    color: 'text-accent-600 dark:text-accent-400',
    icon: '📋',
    bgColor: 'bg-accent-50/50 dark:bg-accent-900/20',
    borderColor: 'border-accent-100/60 dark:border-accent-800/30',
    iconBgColor: 'bg-accent-100 dark:bg-accent-800',
    label: 'Vize Başvuru'
  },
  VIZE_RANDEVU: {
    color: 'text-secondary-600 dark:text-secondary-400',
    icon: '📅',
    bgColor: 'bg-secondary-50/50 dark:bg-secondary-900/20',
    borderColor: 'border-secondary-100/60 dark:border-secondary-800/30',
    iconBgColor: 'bg-secondary-100 dark:bg-secondary-800',
    label: 'Vize Randevu'
  },
  VIZE_SONUC: {
    color: 'text-success-600 dark:text-success-400',
    icon: '✅',
    bgColor: 'bg-success-50/50 dark:bg-success-900/20',
    borderColor: 'border-success-100/60 dark:border-success-800/30',
    iconBgColor: 'bg-success-100 dark:bg-success-800',
    label: 'Vize Sonuç'
  },
  BITEN: {
    color: 'text-gray-600 dark:text-gray-400',
    icon: '🏁',
    bgColor: 'bg-gray-50/50 dark:bg-gray-800/50',
    borderColor: 'border-gray-100/60 dark:border-gray-700/30',
    iconBgColor: 'bg-gray-100 dark:bg-gray-700',
    label: 'Biten'
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
      
      // Öğrencinin stage değerini normalize et
      const normalizedStage = student.stage ? STAGE_MAPPING[student.stage] || 'SUREC_BASLATILDI' : 'SUREC_BASLATILDI';
      
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002757] dark:text-blue-300">
            Öğrenciler
          </h1>
          <p className="text-default mt-1">
            Tüm öğrencilerinizi ve süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="card-blur p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300 mt-1">{statsData.totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-100/50 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="card-blur p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-success-600 dark:text-success-400">Aktif Süreçler</p>
                <p className="text-2xl font-bold text-success-700 dark:text-success-300 mt-1">{statsData.activeProcesses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success-100/50 dark:bg-success-900/30 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="card-blur p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-warning-600 dark:text-warning-400">Bekleyen Belgeler</p>
                <p className="text-2xl font-bold text-warning-700 dark:text-warning-300 mt-1">{statsData.pendingDocuments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning-100/50 dark:bg-warning-900/30 flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="card-blur p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-accent-400">Yaklaşan Randevular</p>
                <p className="text-2xl font-bold text-accent-700 dark:text-accent-300 mt-1">{statsData.upcomingAppointments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent-100/50 dark:bg-accent-900/30 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Arama Kutusu */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="İsim, email veya üniversite ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aşama Sütunları */}
        <div className="relative w-full overflow-x-auto pb-4">
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
                          key={student.id || student.email}
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

        {/* Öğrenci Detay Modalı */}
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </motion.div>
    </Layout>
  );
} 