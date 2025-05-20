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
            className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500"
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
            className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500"
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
            className="bg-white p-5 rounded-lg shadow border-l-4 border-yellow-500"
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
            className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500"
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "all" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Tümü
              </button>
              <button 
                onClick={() => setSelectedFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "active" ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Aktif Süreçler
              </button>
              <button 
                onClick={() => setSelectedFilter("new")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "new" ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Yeni Kayıtlar
              </button>
              <button 
                onClick={() => setSelectedFilter("messages")}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedFilter === "messages" ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Okunmamış Mesajlar
              </button>
            </div>
          </div>
        </div>

        {/* Öğrenci Listesi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-500">Öğrenci bulunamadı</p>
              {selectedFilter !== "all" && (
                <button 
                  onClick={() => setSelectedFilter("all")}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Tüm öğrencileri göster
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Üniversite / Program
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son İşlem
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student: Student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                              {student.name?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                            {(student.unreadMessages ?? 0) > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                                {student.unreadMessages}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          student.processStarted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.stage || (student.processStarted ? 'Aktif' : 'Yeni')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.university || 'Henüz Seçilmedi'}</div>
                        <div className="text-sm text-gray-500">{student.program || 'Henüz Seçilmedi'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.updatedAt || '').toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <Link 
                            href={`/advisor/students/${encodeURIComponent(student.email || '')}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            Detaylar
                          </Link>
                          
                          <Link 
                            href={`/advisor/messages?student=${encodeURIComponent(student.email || '')}`}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Mesaj
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
} 