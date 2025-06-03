"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudents } from '@/hooks/useData';

// Student tipini tanımla
interface Student {
  id: string;
  name?: string;
  email?: string;
  processStarted?: boolean;
  stage?: string;
  university?: string;
  program?: string;
  updatedAt: string;
  documents?: any[];
  visa_appointment_date?: string;
  unreadMessages?: number;
  [key: string]: any;
}

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
  YENI: 'Yeni',
  SUREC_BASLATILDI: 'Süreç Başlatıldı',
  ISLEMDE: 'İşlemde',
  VIZE_BASVURU: 'Vize Başvuru',
  VIZE_RANDEVU: 'Vize Randevu',
  VIZE_SONUC: 'Vize Sonuç',
  BITEN: 'BİTEN'
};

// Aşama renkleri ve ikonları
const STAGE_CONFIG = {
  [STAGES.YENI]: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🆕',
    bgColor: 'bg-gray-50/50',
    borderColor: 'border-gray-200'
  },
  [STAGES.SUREC_BASLATILDI]: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🚀',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-200'
  },
  [STAGES.ISLEMDE]: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⚡',
    bgColor: 'bg-yellow-50/50',
    borderColor: 'border-yellow-200'
  },
  [STAGES.VIZE_BASVURU]: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '📝',
    bgColor: 'bg-purple-50/50',
    borderColor: 'border-purple-200'
  },
  [STAGES.VIZE_RANDEVU]: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '📅',
    bgColor: 'bg-orange-50/50',
    borderColor: 'border-orange-200'
  },
  [STAGES.VIZE_SONUC]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '📋',
    bgColor: 'bg-red-50/50',
    borderColor: 'border-red-200'
  },
  [STAGES.BITEN]: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅',
    bgColor: 'bg-green-50/50',
    borderColor: 'border-green-200'
  }
};

// Aşama sıralaması
const STAGE_ORDER = [
  STAGES.YENI,
  STAGES.SUREC_BASLATILDI,
  STAGES.ISLEMDE,
  STAGES.VIZE_BASVURU,
  STAGES.VIZE_RANDEVU,
  STAGES.VIZE_SONUC,
  STAGES.BITEN
];

export default function AdvisorDashboard() {
  const { user, isAdvisor } = useAuth();
  const router = useRouter();
  const { students, isLoading: isLoadingStudents } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeProcesses: 0,
    pendingDocuments: 0,
    upcomingAppointments: 0
  });

  // Erişim kontrolü - sadece danışmanlar erişebilir
  useEffect(() => {
    if (!user) {
      // Kullanıcı girişi yapılmamış
      router.push('/login');
    } else if (!isAdvisor()) {
      // Kullanıcı danışman değil
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

  // Arama ve filtreleme
  const filteredStudents = students ? students.filter((student: Student) => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.university && student.university.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "active") return matchesSearch && student.processStarted;
    if (selectedFilter === "new") return matchesSearch && !student.processStarted;
    if (selectedFilter === "messages") return matchesSearch && (student.unreadMessages ?? 0) > 0;
    
    return matchesSearch;
  }) : [];

  // Öğrencileri aşamalara göre grupla
  const groupedStudents = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = filteredStudents.filter((student: Student) => {
      if (stage === STAGES.YENI) return !student.processStarted;
      return student.stage === stage;
    });
    return acc;
  }, {} as Record<string, Student[]>);

  // Süreci başlatma
  const startStudentProcess = async (studentId: string) => {
    try {
      const response = await fetch('/api/advisor/start-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ studentId })
      });
      
      if (response.ok) {
        // Öğrenci listesini yenile
        useStudents().mutate();
      }
    } catch (error) {
      console.error('Süreç başlatma hatası:', error);
    }
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
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002757]">
            Danışman Paneli
          </h1>
          <p className="text-default mt-1">
            Tüm öğrencilerinizi ve süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 border-l-4 border-l-blue-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Toplam Öğrenci</p>
                <p className="text-2xl font-bold">{statsData.totalStudents}</p>
              </div>
              <div className="text-3xl text-blue-500">👥</div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 border-l-4 border-l-green-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Aktif Süreçler</p>
                <p className="text-2xl font-bold">{statsData.activeProcesses}</p>
              </div>
              <div className="text-3xl text-green-500">📊</div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 border-l-4 border-l-yellow-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Bekleyen Belgeler</p>
                <p className="text-2xl font-bold">{statsData.pendingDocuments}</p>
              </div>
              <div className="text-3xl text-yellow-500">📄</div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 border-l-4 border-l-purple-500"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Yaklaşan Randevular</p>
                <p className="text-2xl font-bold">{statsData.upcomingAppointments}</p>
              </div>
              <div className="text-3xl text-purple-500">📅</div>
            </div>
          </motion.div>
        </div>

        {/* Öğrenci Arama ve Filtreleme */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="İsim, email veya üniversite ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "all" ? 'bg-blue-600 text-white' : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/50'}`}
              >
                Tümü
              </button>
              <button 
                onClick={() => setSelectedFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "active" ? 'bg-green-600 text-white' : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/50'}`}
              >
                Aktif Süreçler
              </button>
              <button 
                onClick={() => setSelectedFilter("new")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "new" ? 'bg-yellow-600 text-white' : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/50'}`}
              >
                Yeni Kayıtlar
              </button>
              <button 
                onClick={() => setSelectedFilter("messages")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "messages" ? 'bg-red-600 text-white' : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/50'}`}
              >
                Okunmamış Mesajlar
              </button>
            </div>
          </div>
        </div>

        {/* Öğrenci Listesi - Kanban Board */}
        <div className="mt-6">
          <div className="flex space-x-4 overflow-x-auto pb-4 px-1">
            {STAGE_ORDER.map((stage) => (
              <motion.div
                key={stage}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className={`flex-none w-80 ${STAGE_CONFIG[stage].bgColor} rounded-xl shadow-sm border ${STAGE_CONFIG[stage].borderColor} backdrop-blur-sm`}
              >
                <div className="p-4 border-b border-gray-100/60 dark:border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{STAGE_CONFIG[stage].icon}</span>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{stage}</h3>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full ${STAGE_CONFIG[stage].color} font-medium`}>
                      {groupedStudents[stage]?.length || 0}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 min-h-[calc(100vh-400px)] max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {groupedStudents[stage]?.map((student: Student) => (
                    <motion.div
                      key={student.id || student.email}
                      variants={itemVariants}
                      className="mb-3 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {student.name?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {student.name}
                              </p>
                              {(student.unreadMessages ?? 0) > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                  {student.unreadMessages}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {student.email}
                            </p>
                            
                            {student.university && (
                              <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-300">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="truncate">{student.university}</span>
                              </div>
                            )}
                            
                            <div className="mt-3 flex space-x-2">
                              <Link 
                                href={`/advisor/students/${encodeURIComponent(student.email || '')}`}
                                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 text-center font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                              >
                                Detaylar
                              </Link>
                              
                              <Link 
                                href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 text-center font-medium shadow-sm transition-all duration-200 hover:shadow-md"
                              >
                                Mesaj
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {(!groupedStudents[stage] || groupedStudents[stage].length === 0) && (
                    <div className="p-6 text-center">
                      <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📭</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bu aşamada öğrenci bulunmuyor
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #CBD5E0;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #A0AEC0;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4A5568;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2D3748;
          }
        `}</style>
      </motion.div>
    </Layout>
  );
} 