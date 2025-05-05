"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedPanel from '@/components/ProtectedPanel';

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

export default function ProcessPanel() {
  const [expandedStage, setExpandedStage] = useState<number | null>(processData.currentStage);

  return (
    <Layout>
      <ProtectedPanel panelName="Süreç Durumu">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#002757]">Süreç Durumu</h1>
            <p className="text-default mt-2">
              Başvuru sürecinizin güncel durumunu ve aşamalarını buradan takip edebilirsiniz.
            </p>
          </div>

          {/* Genel İlerleme Durumu */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#002757]">Genel İlerleme</h2>
                <p className="text-default">Süreç başlangıç: {processData.startDate}</p>
                <p className="text-default">Tahmini bitiş: {processData.estimatedCompletionDate}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="text-4xl font-bold text-[#ff9900]">{processData.progress}%</span>
                <p className="text-default">Tamamlandı</p>
              </div>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <motion.div 
                className="bg-[#ffc105] h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${processData.progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-muted text-sm font-medium">
              {processData.currentStage} / {processData.totalStages} aşama tamamlandı
            </p>
          </div>

          {/* Aşama Detayları */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {processData.stages.map((stage) => (
              <motion.div 
                key={stage.id}
                variants={itemVariants}
                className={`panel border-l-4 ${
                  stage.status === 'completed' ? 'border-green-500' : 
                  stage.status === 'in-progress' ? 'border-[#ffc105]' : 'border-gray-300'
                } cursor-pointer`}
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    stage.status === 'completed' ? 'bg-green-100 text-green-600' : 
                    stage.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="text-xl">{stage.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{stage.name}</h3>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          stage.status === 'completed' ? 'text-green-600' : 
                          stage.status === 'in-progress' ? 'text-[#ff9900]' : 'text-[#444]'
                        }`}>
                          {stage.status === 'completed' ? 'Tamamlandı' : 
                           stage.status === 'in-progress' ? 'Devam Ediyor' : 'Bekliyor'}
                        </span>
                        <button className="ml-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 transition-transform ${expandedStage === stage.id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#444]">{stage.date}</p>
                  </div>
                </div>

                {/* Detay Alanı */}
                {expandedStage === stage.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <p className="text-default">{stage.description}</p>
                    {stage.status === 'in-progress' && (
                      <div className="mt-4 flex justify-between">
                        <button className="btn-primary">
                          Bekleyen Görevleri Görüntüle
                        </button>
                        <button className="btn-secondary">
                          Belge Yükle
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Yardımcı Bilgiler */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200"
          >
            <h3 className="text-lg font-semibold text-[#002757] mb-2">Süreç ile İlgili Sorularınız mı var?</h3>
            <p className="text-default mb-4">
              Danışmanınız Ayşe Demir ile iletişime geçebilir veya sık sorulan soruları inceleyebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">
                Danışmanınıza Mesaj Gönderin
              </button>
              <button className="btn-secondary">
                Sık Sorulan Sorular
              </button>
            </div>
          </motion.div>
        </motion.div>
      </ProtectedPanel>
    </Layout>
  );
} 