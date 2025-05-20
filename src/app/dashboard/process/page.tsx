"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Örnek süreç verileri
const processData = {
  currentStage: 3,
  totalStages: 7,
  startDate: "10 Ocak 2023",
  estimatedCompletionDate: "15 Eylül 2023",
  progress: 42, // yüzde
  stages: [
    { 
      id: 1, 
      name: "Başvuru", 
      status: "completed", 
      date: "10 Ocak 2023",
      description: "Üniversite başvurularınız tamamlandı.",
      icon: "📝"
    },
    { 
      id: 2, 
      name: "Kabul Mektubu", 
      status: "completed", 
      date: "25 Şubat 2023",
      description: "Berlin Technical University'den kabul mektubunuz alındı.",
      icon: "📨"
    },
    { 
      id: 3, 
      name: "Ön Kayıt", 
      status: "in-progress", 
      date: "15 Mart 2023",
      description: "Ön kayıt işlemleri devam ediyor. Ödemeniz onaylandı, diğer belgeler bekleniyor.",
      icon: "✍️"
    },
    { 
      id: 4, 
      name: "Vize Başvurusu", 
      status: "pending", 
      date: "Tahmini: Mayıs 2023",
      description: "Vize randevunuz alındı. Belgelerinizi hazırlamaya başlayabilirsiniz.",
      icon: "🛂"
    },
    { 
      id: 5, 
      name: "Vize Onayı", 
      status: "pending", 
      date: "Tahmini: Haziran 2023",
      description: "Vize başvurunuz sonrasında bu aşamaya geçilecektir.",
      icon: "✅"
    },
    { 
      id: 6, 
      name: "Uçuş ve Konaklama", 
      status: "pending", 
      date: "Tahmini: Ağustos 2023",
      description: "Vize onayı sonrası uçuş ve konaklama planlaması yapılacaktır.",
      icon: "✈️"
    },
    { 
      id: 7, 
      name: "Oryantasyon", 
      status: "pending", 
      date: "Tahmini: Eylül 2023",
      description: "Üniversitenin oryantasyon programına katılım sağlanacaktır.",
      icon: "🎓"
    }
  ]
};

// Panel erişimini kontrol eden bileşen
const ProtectedPanel = ({ children, panelName }: { children: React.ReactNode, panelName: string }) => {
  const { user, startProcess } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
          <p className="mb-4">Bu sayfaya erişmek için giriş yapmalısınız.</p>
          <Link href="/login" className="btn-primary">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  // Süreç başlatılmadıysa blur'lu içerik göster
  if (!user.processStarted) {
    return (
      <div className="relative">
        {/* Blur'lu içerik */}
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Overlay ve "Sürece Başla" butonu */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40 rounded-lg">
          <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-[#002757] mb-4">
              {panelName} Paneline Erişin
            </h2>
            <p className="mb-6 text-gray-600">
              Bu paneli görüntülemek için önce başvuru sürecinizi başlatmanız gerekiyor. Süreci başlattığınızda danışmanınız size en kısa sürede yardımcı olacaktır.
            </p>
            <button 
              onClick={startProcess}
              className="px-6 py-3 bg-[#ff9900] text-white rounded-lg hover:bg-[#e68a00] transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              <span>Süreci Başlat</span>
              <span className="text-lg">🚀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function ProcessPanel() {
  const [expandedStage, setExpandedStage] = useState<number | null>(processData.currentStage);

  return (
    <Layout>
      <ProtectedPanel panelName="Süreç Takip">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#002757]">Süreç Takibi</h1>
            <p className="text-default mt-2">
              Başvuru sürecinizin tüm aşamalarını buradan takip edebilirsiniz.
            </p>
          </div>

          {/* Süreç İlerleme Aşamaları */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Genel Süreç Durumu</h2>
            
            <div className="relative">
              {/* İlerleme çubuğu */}
              <div className="absolute left-7 top-0 bottom-0 w-1 bg-gray-200 z-0"></div>
              
              {/* Aşamalar */}
              <div className="space-y-8 relative z-10">
                {processData.stages.map((step) => (
                  <div key={step.id} className="flex">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in-progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <span className="text-xl">✓</span>
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold ${
                            step.status === 'completed' ? 'text-green-700' :
                            step.status === 'in-progress' ? 'text-blue-700' :
                            'text-gray-500'
                          }`}>
                            {step.name}
                          </h3>
                          <p className="text-default mt-1">{step.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {step.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yapılacaklar Listesi */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Yapılacaklar</h2>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                <span className="text-yellow-500 mr-3 text-lg">⚠️</span>
                <span className="text-default">Eksik belgeleri 1 hafta içinde yükleyin</span>
              </div>
              
              <div className="flex items-center p-3 border border-blue-200 bg-blue-50 rounded-md">
                <span className="text-blue-500 mr-3 text-lg">📝</span>
                <span className="text-default">Vize randevusu için danışmanınızla iletişime geçin</span>
              </div>
              
              <div className="flex items-center p-3 border border-green-200 bg-green-50 rounded-md">
                <span className="text-green-500 mr-3 text-lg">🗓️</span>
                <span className="text-default">Vize randevunuz için önümüzdeki tarihler kontrol ediliyor</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/dashboard/messages" 
                className="btn-primary inline-block w-full text-center"
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