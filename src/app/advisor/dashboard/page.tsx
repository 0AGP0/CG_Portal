"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import StudentDetailsModal from '@/components/StudentDetailsModal';
import { useAuth } from '@/context/AuthContext';
import { Student } from '@/types/student';

// Aşama konfigürasyonu
const STAGES: { [key: string]: string } = {
  'initial_contact': 'İlk İletişim',
  'consultation': 'Danışmanlık',
  'application_preparation': 'Başvuru Hazırlığı',
  'application_submitted': 'Başvuru Gönderildi',
  'under_review': 'İncelemede',
  'accepted': 'Kabul Edildi',
  'visa_process': 'Vize Süreci',
  'completed': 'Tamamlandı'
};

const STAGE_ORDER = [
  'initial_contact',
  'consultation', 
  'application_preparation',
  'application_submitted',
  'under_review',
  'accepted',
  'visa_process',
  'completed'
];

const STAGE_CONFIG = {
  initial_contact: {
    icon: '📞',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  consultation: {
    icon: '💬',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconBgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  application_preparation: {
    icon: '📝',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconBgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  application_submitted: {
    icon: '📤',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  under_review: {
    icon: '🔍',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
  accepted: {
    icon: '✅',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    iconBgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  visa_process: {
    icon: '🛂',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  completed: {
    icon: '🎓',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
  }
};

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function AdvisorDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStage, setSelectedStage] = useState('initial_contact');

  // İstatistik verileri
  const statsData = {
    totalStudents: students.length,
    activeProcesses: students.filter(s => s.stage !== 'completed').length,
    pendingDocuments: students.filter(s => (s as any).pendingDocuments && (s as any).pendingDocuments > 0).length,
    upcomingAppointments: students.filter(s => (s as any).nextAppointment).length
  };

  // Öğrencileri aşamaya göre filtrele
  const getStudentsByStage = (stage: string) => {
    return students.filter(student => student.stage === stage);
  };

  // Arama filtresi
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.university?.toLowerCase().includes(searchLower)
    );
  });

  // Öğrenci verilerini yükle
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/advisor/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Öğrenci verileri yüklenirken hata:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    if (user) {
      fetchStudents();
    }
  }, [user]);

  // Loading durumu
  useEffect(() => {
    setIsLoading(false);
  }, []);

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
      <div className="w-full">
        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#002757] dark:text-blue-300">
            Öğrenciler
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
            Tüm öğrencilerinizi ve süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Toplam Öğrenci</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{statsData.totalStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Aktif Süreçler</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{statsData.activeProcesses}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Bekleyen Belgeler</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{statsData.pendingDocuments}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Yaklaşan Randevular</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{statsData.upcomingAppointments}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arama Kutusu */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="İsim, email veya üniversite ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-sm"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Görünüm - Sütunlar */}
        <div className="hidden lg:block">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {STAGE_ORDER.map((stage) => {
              const stageStudents = getStudentsByStage(stage);
              const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
              
              return (
                <div
                  key={stage}
                  className={`${config.bgColor} ${config.borderColor} rounded-xl border shadow-sm w-[350px] flex-shrink-0`}
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
                        <span className="text-lg">{config.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {STAGES[stage]}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stageStudents.length} öğrenci
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {stageStudents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Bu aşamada öğrenci bulunmuyor
                      </p>
                    ) : (
                      stageStudents.map((student: Student) => (
                        <div
                          key={student.email}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                              {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {student.email}
                              </p>
                            </div>
                            {(student.unreadMessages ?? 0) > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {student.unreadMessages}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Detaylar
                            </button>
                            <Link 
                              href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                              className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors text-center"
                            >
                              Mesaj
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobil Görünüm - Slider */}
        <div className="lg:hidden">
          {/* Aşama Seçici */}
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {STAGE_ORDER.map((stage) => {
                const stageStudents = getStudentsByStage(stage);
                const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
                
                return (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStage === stage
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {STAGES[stage]}
                    <span className="ml-1 bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs">
                      {stageStudents.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seçili Aşama Öğrencileri */}
          <div className="space-y-3">
            {getStudentsByStage(selectedStage).map((student: Student) => (
              <div
                key={student.email}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {student.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {(student.unreadMessages ?? 0) > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {student.unreadMessages}
                            </span>
                          )}
                                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_CONFIG[selectedStage as keyof typeof STAGE_CONFIG].color} ${STAGE_CONFIG[selectedStage as keyof typeof STAGE_CONFIG].bgColor} border ${STAGE_CONFIG[selectedStage as keyof typeof STAGE_CONFIG].borderColor}`}>
                             {STAGES[selectedStage]}
                           </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Detay</span>
                    </button>
                    
                    <Link 
                      href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                      className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Mesaj</span>
                    </Link>
                    
                    <Link 
                      href={`/advisor/documents?student=${encodeURIComponent(student.email || '')}`}
                      className="bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Belge</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {getStudentsByStage(selectedStage).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Bu aşamada öğrenci bulunmuyor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Öğrenci Detay Modalı */}
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </div>
    </Layout>
  );
} 