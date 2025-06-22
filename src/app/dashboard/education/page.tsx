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
            console.log('API yanıtı:', data); // Debug için
            setStudentData(data.student);
            
            // Son güncelleme tarihi
            const updateDate = data.student?.updated_at;
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
        className="space-y-6"
      >
        {/* Başlık ve Son Güncelleme */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Kişisel Bilgiler
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')}
            </p>
          )}
        </div>

        {/* Kişisel Bilgiler */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
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
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_doum_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Doğum Yeri</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_doum_yeri || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Medeni Durum</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_medeni_durum_1 || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Numarası</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_pasaport_numaras || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Türü</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_pasaport_tr || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Veriliş Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_verili_tarihi || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pasaport Geçerlilik Tarihi</p>
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

        {/* Anne Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Anne Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ad</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_ad || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Soyad</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_anne_soyad || "-"}</p>
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
        </motion.div>

        {/* Baba Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Baba Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ad</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_ad || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Soyad</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_baba_soyad || "-"}</p>
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
        </motion.div>

        {/* Eğitim Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Eğitim Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Adı</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_ad || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Türü</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_tr || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Şehri</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_ehir || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Başlangıç Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_balang_tarihi_1 || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Lise Bitiş Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_lise_biti_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Adı</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_ad || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Bölümü</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_blm_ad || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Başlangıç Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_balang_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Bitiş Tarihi</p>
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
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Üniversite Tercihleri</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_niversite_tercihleri || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Almanya Bölüm Tercihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_de_blm_tercihi || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Dil Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Dil Bilgileri</h3>
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
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dil Öğrenim Durumu</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_dil_renim_durumu || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Vize Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Vize Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Konsolosluk</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_konsolosluk_1 || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Vize Başvuru Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_vize_bavuru_tarihi_1 || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Vize Randevu Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_vize_randevu_tarihi || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Vize Randevu Belgesi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_vize_randevu_belgesi || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Finansal Bilgiler */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Finansal Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Finansal Kanıt</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_finansal_kant || "-"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Maddi Kanıt Durumu</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_maddi_kant_durumu || "-"}</p>
            </div>
          </div>
        </motion.div>

        {/* Sınav Bilgileri */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Sınav Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sınav Girişi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_sym_snav_giri ? "Evet" : "Hayır"}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sınav Sonuç Tarihi</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{studentData?.x_studio_sym_yerlestirme_sonuc_tarihi || "-"}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
} 