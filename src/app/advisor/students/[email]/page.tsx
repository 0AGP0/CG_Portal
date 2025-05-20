"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudentDetail } from '@/hooks/useStudents';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08
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

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdvisor } = useAuth();
  
  // URL'den öğrenci email'ini al
  const studentEmail = typeof params.email === 'string' ? decodeURIComponent(params.email) : '';
  
  // Öğrenci detaylarını çek
  const { student, isLoading, isError } = useStudentDetail(studentEmail);

  // Erişim kontrolü
  if (!user || !isAdvisor()) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="mb-4">Bu sayfaya erişmek için danışman olarak giriş yapmalısınız.</p>
            <Link href="/login" className="btn-primary">
              Giriş Sayfasına Dön
            </Link>
          </div>
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
        {/* Üst başlık ve geri butonu */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button 
              onClick={() => router.back()} 
              className="text-blue-600 mb-2 flex items-center hover:underline"
            >
              <span className="mr-1">←</span> Danışman Paneli
            </button>
            <h1 className="text-3xl font-bold text-[#002757]">
              Öğrenci Profili
            </h1>
            {student && student.name && (
              <p className="text-xl text-[#ff9900] font-medium mt-1">
                {student.name}
              </p>
            )}
          </div>
          
          <Link 
            href={`/advisor/students/${encodeURIComponent(studentEmail)}/documents`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-lg">📁</span>
            <span>Belgeleri Yönet</span>
          </Link>
        </div>
        
        {/* Yükleniyor durumu */}
        {isLoading && (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-500">Öğrenci bilgileri yükleniyor...</span>
          </div>
        )}
        
        {/* Hata durumu */}
        {isError && (
          <div className="bg-red-50 text-red-800 p-6 rounded-md">
            <p className="font-medium">Öğrenci bilgileri yüklenirken bir hata oluştu.</p>
            <p className="mt-2">Lütfen internet bağlantınızı kontrol edip tekrar deneyin.</p>
          </div>
        )}
        
        {/* Öğrenci bulunamadıysa */}
        {!isLoading && !isError && !student && (
          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-md">
            <p className="font-medium">Öğrenci bulunamadı.</p>
            <p className="mt-2">Belirtilen e-posta adresine sahip bir öğrenci kaydı bulunamadı.</p>
          </div>
        )}
        
        {/* Öğrenci bilgileri bulunduysa */}
        {!isLoading && !isError && student && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Temel Profil Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Kişisel Bilgiler
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">E-posta:</span>
                  <span>{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Telefon:</span>
                  <span>{student.phone || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Yaş:</span>
                  <span>{student.age || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Tarihi:</span>
                  <span>{student.birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Yeri:</span>
                  <span>{student.birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Medeni Durum:</span>
                  <span>{student.marital_status || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Adres:</span>
                  <span className="text-right max-w-[250px]">{student.contact_address || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Vize ve Pasaport Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Vize & Pasaport Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Pasaport No:</span>
                  <span>{student.passport_number || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Pasaport Tipi:</span>
                  <span>{student.passport_type || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Veren Makam:</span>
                  <span>{student.issuing_authority || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">PNR No:</span>
                  <span>{student.pnr_number || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Vize Başvuru:</span>
                  <span>{student.visa_application_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Vize Randevu:</span>
                  <span className="font-semibold text-green-600">{student.visa_appointment_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Konsolosluk:</span>
                  <span>{student.consulate || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Almanya'da Bulunma:</span>
                  <span>{student.has_been_to_germany ? 'Evet' : 'Hayır'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Eğitim Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Eğitim Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-blue-700">Üniversite</h3>
                  <p className="mt-1">{student.university_name || '---'}</p>
                  <p className="text-sm text-gray-600">{student.university_department || '---'}</p>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>Başlangıç: {student.university_start_date || '---'}</span>
                    <span>Bitiş: {student.university_end_date || '---'}</span>
                  </div>
                  <p className="text-sm mt-1">
                    Mezuniyet Durumu: {student.graduation_status || '---'}
                  </p>
                  <p className="text-sm">
                    Mezuniyet Yılı: {student.graduation_year || '---'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-700">Lise</h3>
                  <p className="mt-1">{student.high_school_name || '---'}</p>
                  <p className="text-sm text-gray-600">
                    {student.high_school_type || '---'} / {student.high_school_city || '---'}
                  </p>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>Başlangıç: {student.high_school_start_date || '---'}</span>
                    <span>Mezuniyet: {student.high_school_graduation_date || '---'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Dil Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Dil Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Almanca Seviyesi:</span>
                  <span>{student.language_level || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Sertifika:</span>
                  <span>{student.language_certificate || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Dil Öğrenim Durumu:</span>
                  <span>{student.language_learning_status || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Dil Kursu Kaydı:</span>
                  <span>{student.language_course_registration ? 'Var' : 'Yok'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Süreç Durumu */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Süreç Durumu
              </h2>
              <div className="flex items-center justify-center p-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    student.stage === 'BİTEN' || student.stage === 'biten' 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`}>
                    {student.stage || 'Yeni'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Son güncelleme: {new Date(student.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Sınav Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Sınav Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Sınav Girişi:</span>
                  <span>{student.exam_entry ? 'Evet' : 'Hayır'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Sınav Sonuç Tarihi:</span>
                  <span>{student.exam_result_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Üniversite Tercihleri:</span>
                  <span>{student.university_preferences || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Almanya Bölüm Tercihi:</span>
                  <span>{student.german_department_preference || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Finansal Bilgiler */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Finansal Bilgiler
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Finansal Kanıt:</span>
                  <span>{student.financial_proof || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Maddi Kanıt Durumu:</span>
                  <span>{student.financial_proof_status ? 'Tamam' : 'Bekliyor'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Anne Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Anne Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Ad Soyad:</span>
                  <span>{`${student.mother_name || '---'} ${student.mother_surname || '---'}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Tarihi:</span>
                  <span>{student.mother_birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Yeri:</span>
                  <span>{student.mother_birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">İkamet:</span>
                  <span>{student.mother_residence || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Telefon:</span>
                  <span>{student.mother_phone || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Baba Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
                Baba Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Ad Soyad:</span>
                  <span>{`${student.father_name || '---'} ${student.father_surname || '---'}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Tarihi:</span>
                  <span>{student.father_birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doğum Yeri:</span>
                  <span>{student.father_birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">İkamet:</span>
                  <span>{student.father_residence || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Telefon:</span>
                  <span>{student.father_phone || '---'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
} 