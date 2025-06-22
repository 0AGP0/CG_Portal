'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/utils/logger';
import { Student } from '@/types/student';

export interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [lastFetchedEmail, setLastFetchedEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!student?.email) {
        logger.error('Öğrenci e-postası eksik');
        setError('Öğrenci bilgisi eksik');
        setIsLoading(false);
        return;
      }

      if (lastFetchedEmail === student.email && studentData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        logger.info('Öğrenci detayları getiriliyor:', { studentEmail: student.email });
        
        const response = await fetch(`/api/advisor/students/${encodeURIComponent(student.email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Öğrenci detayları alınamadı');
        }

        const data = await response.json();
        logger.info('Öğrenci detayları başarıyla getirildi');
        setStudentData(data);
        setLastFetchedEmail(student.email);
      } catch (error) {
        logger.error('Öğrenci detayları getirme hatası:', error);
        setError(error instanceof Error ? error.message : 'Öğrenci detayları alınamadı');
      } finally {
        setIsLoading(false);
      }
    };

    if (student?.email) {
      fetchStudentDetails();
    }
  }, [student?.email, lastFetchedEmail]);

  if (!student) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
    <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl"
          onClick={e => e.stopPropagation()}
        >
        {/* Modal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? 'Yükleniyor...' : studentData?.name || student.name}
          </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {student.email}
              </p>
            </div>
          <button
            onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>

        {/* Modal Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-200 opacity-40"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-600 animate-spin"></div>
            </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Öğrenci bilgileri yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Hata</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : studentData ? (
              <div className="space-y-6">
                {/* Kişisel Bilgiler */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kişisel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.birthDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Yeri</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.birthPlace || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Yaş</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.age || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Medeni Durum</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.maritalStatus || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Anne Bilgileri */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Anne Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.mother?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.mother?.birthDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Yeri</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.mother?.birthPlace || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">İkamet</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.mother?.residence || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.mother?.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Baba Bilgileri */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Baba Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.father?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.father?.birthDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doğum Yeri</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.father?.birthPlace || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">İkamet</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.father?.residence || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.father?.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Pasaport Bilgileri */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pasaport Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pasaport Numarası</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.number || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pasaport Tipi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Veriliş Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.issueDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Geçerlilik Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.expiryDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Veren Makam</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.issuingAuthority || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">PNR Numarası</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.passport?.pnrNumber || '-'}</p>
                    </div>
              </div>
            </div>

            {/* Eğitim Bilgileri */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Eğitim Bilgileri</h3>
                  
                  {/* Lise Bilgileri */}
                  <div className="mb-6">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Lise Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lise Adı</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.highSchool?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Lise Tipi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.highSchool?.type || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Şehir</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.highSchool?.city || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mezuniyet Tarihi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.highSchool?.graduationDate || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">YKS Yerleştirme Tarihi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.highSchool?.yksDate || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Üniversite Bilgileri */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Üniversite Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Üniversite Adı</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Bölüm</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.department || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Başlangıç Tarihi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.startDate || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mezuniyet Tarihi</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.endDate || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mezuniyet Durumu</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.graduationStatus || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mezuniyet Yılı</p>
                        <p className="font-medium text-gray-900 dark:text-white">{studentData.education?.university?.graduationYear || '-'}</p>
                      </div>
              </div>
              </div>
            </div>

            {/* Dil Bilgileri */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dil Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Almanca Seviyesi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.language?.germanLevel || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Almanca Sertifikası</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.language?.germanCertificate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dil Kursu Kaydı</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.language?.languageCourse || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dil Öğrenim Durumu</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.language?.learningStatus || '-'}</p>
                    </div>
                  </div>
            </div>

                {/* Sistem Detayları */}
                <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sistem Detayları</h3>
            <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mevcut Aşama</p>
                      <p className="font-medium text-gray-900 dark:text-white">{studentData.systemDetails?.stage || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Son Güncelleme</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {studentData.systemDetails?.lastUpdateTime 
                          ? new Date(studentData.systemDetails.lastUpdateTime).toLocaleString('tr-TR')
                          : '-'}
                      </p>
                    </div>
                    {studentData.systemDetails?.isUpdated && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg text-sm">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              Süreç güncellendi: <span className="font-bold">{studentData.systemDetails.stage}</span>
                            </p>
            </div>
            </div>
            </div>
                    )}
            </div>
          </div>
        </div>
            ) : null}
      </div>
    </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 