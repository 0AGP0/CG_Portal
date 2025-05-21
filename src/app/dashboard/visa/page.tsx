"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedPanel from '@/components/ProtectedPanel';

// Örnek vize bilgileri
const visaData = {
  appointmentDate: "20 Mayıs 2023",
  appointmentTime: "14:30",
  location: "Alman Konsolosluğu, İstanbul",
  status: "Onaylandı",
  requiredDocuments: [
    { id: 1, name: "Pasaport", status: "completed" },
    { id: 2, name: "Kabul Mektubu", status: "completed" },
    { id: 3, name: "Finansal Belgeler", status: "pending" },
    { id: 4, name: "Seyahat Sigortası", status: "pending" },
    { id: 5, name: "Özgeçmiş (CV)", status: "completed" },
    { id: 6, name: "Motivasyon Mektubu", status: "pending" },
  ]
};

export default function VisaPanel() {
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
              Vize randevunuzun detayları ve gerekli dokümanların durumunu buradan takip edebilirsiniz.
            </p>
          </div>

          {/* Vize Randevu Bilgileri */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Randevu Bilgileri</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Randevu Tarihi</p>
                    <p className="text-lg font-semibold text-[#002757]">{visaData.appointmentDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Randevu Saati</p>
                    <p className="text-lg font-semibold text-[#002757]">{visaData.appointmentTime}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Konum</p>
                    <p className="text-lg font-semibold text-[#002757]">{visaData.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100/70 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center mr-3">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <p className="font-medium text-default">Durum</p>
                    <p className="text-lg font-semibold text-green-600">{visaData.status}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn-secondary mr-3">Takvime Ekle</button>
              <button className="btn-primary">Randevu Detaylarını Yazdır</button>
            </div>
          </div>

          {/* Gerekli Evraklar */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Gerekli Evraklar</h2>
            
            <div className="space-y-3">
              {visaData.requiredDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 border border-gray-200/60 dark:border-gray-700/30 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      doc.status === 'completed' ? 'bg-green-100/70 dark:bg-green-900/30 text-green-600 dark:text-green-300' : 'bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300'
                    }`}>
                      {doc.status === 'completed' ? '✓' : '!'}
                    </div>
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  
                  <div>
                    {doc.status === 'completed' ? (
                      <span className="text-sm px-3 py-1 bg-green-100/70 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full">
                        Tamamlandı
                      </span>
                    ) : (
                      <button className="btn-sm btn-primary">
                        Yükle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-2"></div>
                <span className="text-sm text-default">Yeşil: Tamamlandı</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 mr-2"></div>
                <span className="text-sm text-default">Sarı: Bekliyor</span>
              </div>
            </div>
          </div>

          {/* Vize Süreci Bilgilendirme */}
          <div className="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-sm p-6 rounded-lg border border-blue-200/60 dark:border-blue-700/30">
            <h3 className="text-lg font-semibold text-[#002757] mb-2">Vize Süreci Bilgilendirme</h3>
            <p className="text-default mb-4">
              Vize başvurunuzun sorunsuz ilerlemesi için gerekli tüm belgeleri eksiksiz ve doğru bir şekilde hazırlamanız önemlidir. Eksik veya hatalı belgeler başvurunuzun reddedilmesine sebep olabilir.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">
                Vize Kontrol Listesini İndir
              </button>
              <button className="px-4 py-2 rounded-lg text-primary-600 dark:text-primary-400 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-100/60 dark:border-gray-700/30 transition-colors">
                Vize Başvurusu Hakkında SSS
              </button>
            </div>
          </div>
        </motion.div>
      </ProtectedPanel>
    </Layout>
  );
} 