"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudentDetail } from '@/hooks/useData';
import { toast } from 'react-hot-toast';

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
  const [isEditingVisa, setIsEditingVisa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // URL'den öğrenci email'ini al
  const studentEmail = typeof params.email === 'string' ? decodeURIComponent(params.email) : '';
  
  // Öğrenci detaylarını çek
  const { student, isLoading, isError, mutate } = useStudentDetail(studentEmail);

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

  const handleVisaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        passport_number: formData.get('passport_number'),
        passport_type: formData.get('passport_type'),
        issuing_authority: formData.get('issuing_authority'),
        pnr_number: formData.get('pnr_number'),
        visa_application_date: formData.get('visa_application_date'),
        visa_appointment_date: formData.get('visa_appointment_date'),
        consulate: formData.get('consulate'),
        has_been_to_germany: formData.get('has_been_to_germany') === 'true'
      };

      const response = await fetch(`/api/advisor/students/${params.email}/visa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Vize bilgileri güncellenirken bir hata oluştu');
      }

      toast.success('Vize bilgileri başarıyla güncellendi');
      setIsEditingVisa(false);
      mutate(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Vize bilgileri güncelleme hatası:', error);
      toast.error('Vize bilgileri güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            href={`/advisor/documents?student=${encodeURIComponent(studentEmail)}`}
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
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Kişisel Bilgiler
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">E-posta:</span>
                  <span className="dark:text-gray-100">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Telefon:</span>
                  <span className="dark:text-gray-100">{student.phone || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Yaş:</span>
                  <span className="dark:text-gray-100">{student.age || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Tarihi:</span>
                  <span className="dark:text-gray-100">{student.birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Yeri:</span>
                  <span className="dark:text-gray-100">{student.birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Medeni Durum:</span>
                  <span className="dark:text-gray-100">{student.marital_status || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Adres:</span>
                  <span className="text-right max-w-[250px] dark:text-gray-100">{student.contact_address || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Vize ve Pasaport Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Vize & Pasaport Bilgileri
              </h2>
                <button
                  onClick={() => setIsEditingVisa(!isEditingVisa)}
                  className="btn-secondary text-sm"
                >
                  {isEditingVisa ? 'Düzenlemeyi İptal Et' : 'Düzenle'}
                </button>
              </div>

              {isEditingVisa ? (
                <form onSubmit={handleVisaSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Pasaport No
                      </label>
                      <input
                        type="text"
                        name="passport_number"
                        defaultValue={student.passport_number || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Pasaport Tipi
                      </label>
                      <input
                        type="text"
                        name="passport_type"
                        defaultValue={student.passport_type || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Veren Makam
                      </label>
                      <input
                        type="text"
                        name="issuing_authority"
                        defaultValue={student.issuing_authority || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        PNR No
                      </label>
                      <input
                        type="text"
                        name="pnr_number"
                        defaultValue={student.pnr_number || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Vize Başvuru Tarihi
                      </label>
                      <input
                        type="date"
                        name="visa_application_date"
                        defaultValue={student.visa_application_date || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Vize Randevu Tarihi
                      </label>
                      <input
                        type="date"
                        name="visa_appointment_date"
                        defaultValue={student.visa_appointment_date || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Konsolosluk
                      </label>
                      <input
                        type="text"
                        name="consulate"
                        defaultValue={student.consulate || ''}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Almanya'da Bulunma
                      </label>
                      <select
                        name="has_been_to_germany"
                        defaultValue={student.has_been_to_germany ? 'true' : 'false'}
                        className="form-select"
                      >
                        <option value="false">Hayır</option>
                        <option value="true">Evet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditingVisa(false)}
                      className="btn-secondary"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Pasaport No:</span>
                  <span className="dark:text-gray-100">{student.passport_number || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Pasaport Tipi:</span>
                  <span className="dark:text-gray-100">{student.passport_type || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Veren Makam:</span>
                  <span className="dark:text-gray-100">{student.issuing_authority || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">PNR No:</span>
                  <span className="dark:text-gray-100">{student.pnr_number || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Vize Başvuru:</span>
                  <span className="dark:text-gray-100">{student.visa_application_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Vize Randevu:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{student.visa_appointment_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Konsolosluk:</span>
                  <span className="dark:text-gray-100">{student.consulate || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Almanya'da Bulunma:</span>
                  <span className="dark:text-gray-100">{student.has_been_to_germany ? 'Evet' : 'Hayır'}</span>
                </div>
              </div>
              )}
            </motion.div>
            
            {/* Eğitim Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Eğitim Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-400">Üniversite</h3>
                  <p className="mt-1 dark:text-gray-100">{student.university_name || '---'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.university_department || '---'}</p>
                  <div className="flex justify-between mt-1 text-sm dark:text-gray-300">
                    <span>Başlangıç: {student.university_start_date || '---'}</span>
                    <span>Bitiş: {student.university_end_date || '---'}</span>
                  </div>
                  <p className="text-sm mt-1 dark:text-gray-300">
                    Mezuniyet Durumu: {student.graduation_status || '---'}
                  </p>
                  <p className="text-sm dark:text-gray-300">
                    Mezuniyet Yılı: {student.graduation_year || '---'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-400">Lise</h3>
                  <p className="mt-1 dark:text-gray-100">{student.high_school_name || '---'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.high_school_type || '---'} / {student.high_school_city || '---'}
                  </p>
                  <div className="flex justify-between mt-1 text-sm dark:text-gray-300">
                    <span>Başlangıç: {student.high_school_start_date || '---'}</span>
                    <span>Mezuniyet: {student.high_school_graduation_date || '---'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Dil Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Dil Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Almanca Seviyesi:</span>
                  <span className="dark:text-gray-100">{student.language_level || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Sertifika:</span>
                  <span className="dark:text-gray-100">{student.language_certificate || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Dil Öğrenim Durumu:</span>
                  <span className="dark:text-gray-100">{student.language_learning_status || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Dil Kursu Kaydı:</span>
                  <span className="dark:text-gray-100">{student.language_course_registration ? 'Var' : 'Yok'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Süreç Durumu */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Süreç Durumu
              </h2>
              <div className="flex items-center justify-center p-4">
                  <div className={`text-4xl font-bold mb-2 ${
                    student.stage === 'BİTEN' || student.stage === 'biten' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {student.stage || 'Yeni'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Son güncelleme: {new Date(student.updatedAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </motion.div>
            
            {/* Sınav Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Sınav Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Sınav Girişi:</span>
                  <span className="dark:text-gray-100">{student.exam_entry ? 'Evet' : 'Hayır'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Sınav Sonuç Tarihi:</span>
                  <span className="dark:text-gray-100">{student.exam_result_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Üniversite Tercihleri:</span>
                  <span className="dark:text-gray-100">{student.university_preferences || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Almanya Bölüm Tercihi:</span>
                  <span className="dark:text-gray-100">{student.german_department_preference || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Finansal Bilgiler */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Finansal Bilgiler
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Finansal Kanıt:</span>
                  <span className="dark:text-gray-100">{student.financial_proof || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Maddi Kanıt Durumu:</span>
                  <span className="dark:text-gray-100">{student.financial_proof_status ? 'Tamam' : 'Bekliyor'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Anne Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Anne Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Ad Soyad:</span>
                  <span className="dark:text-gray-100">{`${student.mother_name || '---'} ${student.mother_surname || '---'}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Tarihi:</span>
                  <span className="dark:text-gray-100">{student.mother_birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Yeri:</span>
                  <span className="dark:text-gray-100">{student.mother_birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">İkamet:</span>
                  <span className="dark:text-gray-100">{student.mother_residence || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Telefon:</span>
                  <span className="dark:text-gray-100">{student.mother_phone || '---'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Baba Bilgileri */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300 border-b border-gray-200/80 dark:border-gray-700/50 pb-2">
                Baba Bilgileri
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Ad Soyad:</span>
                  <span className="dark:text-gray-100">{`${student.father_name || '---'} ${student.father_surname || '---'}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Tarihi:</span>
                  <span className="dark:text-gray-100">{student.father_birth_date || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Doğum Yeri:</span>
                  <span className="dark:text-gray-100">{student.father_birth_place || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">İkamet:</span>
                  <span className="dark:text-gray-100">{student.father_residence || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Telefon:</span>
                  <span className="dark:text-gray-100">{student.father_phone || '---'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
} 