"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

export default function PersonalInfoPage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Kişisel bilgileri API'den çek
    const fetchPersonalData = async () => {
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
            
            // Son güncelleme tarihi
            const updateDate = data.student?.systemDetails?.lastUpdateTime || data.student?.systemDetails?.lastUpdated;
            setLastUpdated(updateDate);
          }
        }
      } catch (error) {
        console.error('Kişisel bilgiler çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPersonalData();
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
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002757]">Kişisel Bilgiler</h1>
          <p className="text-default mt-1">Başvuru sürecinizdeki kişisel bilgilerinizi görebilirsiniz.</p>
          
          {lastUpdated && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md inline-block">
              Son güncelleme: {lastUpdated}
            </div>
          )}
        </div>
        
        {/* Temel Bilgiler */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ad Soyad</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.name || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">E-posta</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.email || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Telefon</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.phone || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.birth_date || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Yeri</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.birth_place || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Yaş</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.age || "-"}</p>
            </div>
          </div>
          
          {/* Bilgi yoksa uyarı */}
          {!studentData?.name && !studentData?.birth_date && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md text-yellow-800 dark:text-yellow-300">
              <p className="text-sm">Temel bilgileriniz henüz eklenmemiş. Lütfen danışmanınızla iletişime geçin.</p>
            </div>
          )}
        </motion.div>
        
        {/* Adres Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Adres Bilgileri</h2>
          
          <div className="mb-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">İletişim Adresi</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.contact_address || "-"}</p>
          </div>
          
          {/* Bilgi yoksa uyarı */}
          {!studentData?.contact_address && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md text-yellow-800 dark:text-yellow-300">
              <p className="text-sm">Adres bilgileriniz henüz eklenmemiş. Lütfen danışmanınızla iletişime geçin.</p>
            </div>
          )}
        </motion.div>
        
        {/* Pasaport Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Pasaport Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Numarası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.number || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Tipi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.type || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Veriliş Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.issueDate || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Geçerlilik Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.expiryDate || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Veren Makam</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.passport?.issuingAuthority || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">PNR Numarası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.pnr_number || "-"}</p>
            </div>
          </div>
          
          {/* Bilgi yoksa uyarı */}
          {!studentData?.passport?.number && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md text-yellow-800 dark:text-yellow-300">
              <p className="text-sm">Pasaport bilgileriniz henüz eklenmemiş. Lütfen danışmanınızla iletişime geçin.</p>
            </div>
          )}
        </motion.div>
        
        {/* Eğitim Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Eğitim Bilgileri</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Lise Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Lise Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Adı</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.high_school_name || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Tipi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.high_school_type || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Şehir</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.high_school_city || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Başlangıç-Bitiş Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {studentData?.high_school_start_date || "-"} / {studentData?.high_school_graduation_date || "-"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Üniversite Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Üniversite Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Adı</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.university_name || studentData?.university || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Bölüm</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.university_department || studentData?.program || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Başlangıç-Bitiş Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {studentData?.university_start_date || "-"} / {studentData?.university_end_date || "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mezuniyet Durumu</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.graduation_status || "-"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bilgi yoksa uyarı */}
          {!studentData?.high_school_name && !studentData?.university_name && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md text-yellow-800 dark:text-yellow-300">
              <p className="text-sm">Eğitim bilgileriniz henüz eklenmemiş. Lütfen danışmanınızla iletişime geçin.</p>
            </div>
          )}
        </motion.div>
        
        {/* Dil Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Dil Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Almanca Seviyesi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.language_level || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Almanca Sertifikası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.language_certificate || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dil Kursu Kaydı</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.language_course_registration || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dil Öğrenim Durumu</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.language_learning_status || "-"}</p>
            </div>
          </div>
          
          {/* Bilgi yoksa uyarı */}
          {!studentData?.language_level && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md text-yellow-800 dark:text-yellow-300">
              <p className="text-sm">Dil bilgileriniz henüz eklenmemiş. Lütfen danışmanınızla iletişime geçin.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
} 