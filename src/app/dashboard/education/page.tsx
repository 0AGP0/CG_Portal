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
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_mail_adresi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Telefon</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.phone || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_doum_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Yeri</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_doum_yeri || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Yaş</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_ya || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Medeni Durum</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_medeni_durum_1 || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Finansal Kant</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_finansal_kant || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Aile Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Aile Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anne Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Anne Bilgileri</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ad Soyad</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {studentData?.x_studio_anne_ad} {studentData?.x_studio_anne_soyad || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_doum_tarihi || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Yeri</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_doum_yeri || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">İkamet</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_ikamet_sehrilke || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Telefon</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_telefon || "-"}</p>
                </div>
              </div>
            </div>

            {/* Baba Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Baba Bilgileri</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ad Soyad</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {studentData?.x_studio_baba_ad} {studentData?.x_studio_baba_soyad || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_doum_tarihi || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Yeri</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_doum_yeri || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">İkamet</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_ikamet_ehrilkesi || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Telefon</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_telefon || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Adres Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Adres Bilgileri</h2>
          
          <div className="mb-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">İletişim Adresi</p>
            <p className="font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line">{studentData?.contact_address || "-"}</p>
          </div>
        </motion.div>
        
        {/* Pasaport Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Pasaport Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Numarası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_pasaport_numaras || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Tipi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_pasaport_tr || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Veriliş Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_verili_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Geçerlilik Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_geerlilik_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Veren Makam</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_veren_makam || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">PNR Numarası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_pnr_numaras || "-"}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Eğitim Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-6"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Eğitim Bilgileri</h2>
          
          <div className="space-y-6">
            {/* Lise Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Lise Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Adı</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_ad || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Tipi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_tr || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Şehir</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_ehir || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mezuniyet Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_biti_tarihi || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">YKS Yerleştirme Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_sym_yerlestirme_sonuc_tarihi || "-"}</p>
                </div>
              </div>
            </div>
            
            {/* Üniversite Bilgileri */}
            <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Üniversite Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Adı</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_ad || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Bölüm</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_blm_ad || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Başlangıç Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_balang_tarihi || "-"}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mezuniyet Tarihi</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_biti_tarihi || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mezuniyet Durumu</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_mezuniyet_durumu || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Mezuniyet Yılı</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_mezuniyet_yl || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Dil Bilgileri */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
        >
          <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Dil Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Almanca Seviyesi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_almanca_seviyesi_1 || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Almanca Sertifikası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_almanca_sertifikas || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dil Kursu Kaydı</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_dil_kursu_kayt || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dil Öğrenim Durumu</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_dil_renim_durumu || "-"}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
} 