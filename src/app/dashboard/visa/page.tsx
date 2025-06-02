"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedPanel from '@/components/ProtectedPanel';
import { useAuth } from '@/context/AuthContext';
import { useStudentDetail } from '@/hooks/useData';
import Link from 'next/link';

export default function VisaPanel() {
  const { user } = useAuth();
  const { student: studentData, isLoading } = useStudentDetail(user?.email || '');

  if (isLoading) {
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
      <ProtectedPanel panelName="Vize Bilgileri">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#002757]">Vize Bilgileri</h1>
            <p className="text-default mt-2">
              Vize başvurunuzun detayları ve durumunu buradan takip edebilirsiniz.
            </p>
          </div>

          {/* Vize Randevu Bilgileri */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Randevu Bilgileri</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Başvuru Tarihi</p>
                    <p className="text-lg font-semibold text-[#002757]">
                      {studentData?.visa_application_date || "Henüz belirlenmedi"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Randevu Tarihi</p>
                    <p className="text-lg font-semibold text-[#002757]">
                      {studentData?.visa_appointment_date || "Henüz belirlenmedi"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Konsolosluk</p>
                    <p className="text-lg font-semibold text-[#002757]">
                      {studentData?.consulate || "Henüz belirlenmedi"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Son Güncelleme</p>
                    <p className="text-lg font-semibold text-[#002757]">
                      {studentData?.updatedAt ? new Date(studentData.updatedAt).toLocaleDateString('tr-TR') : "Henüz güncelleme yok"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {!studentData?.visa_appointment_date && (
              <div className="mt-6 p-4 bg-yellow-50/70 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30 rounded-md">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-3">⚠️</span>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Henüz vize randevunuz bulunmuyor. Randevu tarihi belirlendiğinde burada görüntülenecektir.
                  </p>
                </div>
            </div>
            )}
          </div>

          {/* Pasaport Bilgileri */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Pasaport Bilgileri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pasaport Numarası</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {studentData?.passport_number || "Henüz girilmedi"}
                </p>
                  </div>
                  
              <div className="p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pasaport Tipi</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {studentData?.passport_type || "Henüz girilmedi"}
                </p>
            </div>
            
              <div className="p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Veren Makam</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {studentData?.issuing_authority || "Henüz girilmedi"}
                </p>
              </div>
              
              <div className="p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">PNR Numarası</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {studentData?.pnr_number || "Henüz girilmedi"}
                </p>
              </div>
            </div>
          </div>

          {/* Vize Süreci Bilgilendirme */}
          <div className="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-200/60 dark:border-blue-700/30">
            <h3 className="text-lg font-semibold text-[#002757] mb-2">Vize Süreci Bilgilendirme</h3>
            <p className="text-default mb-4">
              Vize başvurunuzun sorunsuz ilerlemesi için gerekli tüm belgeleri eksiksiz ve doğru bir şekilde hazırlamanız önemlidir. 
              Eksik veya hatalı belgeler başvurunuzun reddedilmesine sebep olabilir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/dashboard/messages" 
                className="btn-primary"
              >
                Danışmanla İletişime Geç
              </Link>
            </div>
          </div>
        </motion.div>
      </ProtectedPanel>
    </Layout>
  );
} 