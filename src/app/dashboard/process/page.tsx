"use client";

import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<number | null>(3);

  // Öğrenci verilerini API'den çek
  useEffect(() => {
    const fetchStudentData = async () => {
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
            
            // Duruma göre aşama belirle
            const stageMapping: {[key: string]: number} = {
              'Hazırlık Aşaması': 1,
              'Ceviri Hazir': 2,
              'Ödeme Yapilacaklar': 3,
              'Üniversite Başvurusu Yapılanlar': 4,
              'Kabul Gelenler': 5,
              'Vize Başvuru Aşaması': 6,
              'Süreç Aşaması': 7,
              'Vize Randevusu Atananlar': 8,
              'Vize Bekleme Aşaması': 9,
              'Almanya Aşaması': 10,
              'BİTEN': 11
            };
            
            const stage = data.student?.systemDetails?.stage;
            if (stage === 'BİTEN') {
              setExpandedStage(11); // Son aşama
            } else {
              // Mevcut aşamayı bul veya varsayılan olarak 3'ü kullan
              setExpandedStage(stageMapping[stage] || 3);
            }
          }
        }
      } catch (error) {
        console.error('Öğrenci verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);

  // Öğrenci verisine göre süreç aşamalarını hazırla
  const processData = React.useMemo(() => {
    // Aşamalar
    const defaultStages = [
      { 
        id: 1, 
        name: "Hazırlık Aşaması", 
        status: "completed", 
        date: "10 Ocak 2023",
        description: "Başvuru sürecinizin hazırlık aşaması tamamlandı.",
        icon: "📝"
      },
      { 
        id: 2, 
        name: "Çeviri Hazır", 
        status: "completed", 
        date: "25 Şubat 2023",
        description: "Belgelerinizin çevirileri tamamlandı.",
        icon: "📄"
      },
      { 
        id: 3, 
        name: "Ödeme Yapılacaklar", 
        status: "in-progress", 
        date: "15 Mart 2023",
        description: "Ödeme işlemleri devam ediyor.",
        icon: "💰"
      },
      { 
        id: 4, 
        name: "Üniversite Başvurusu Yapılanlar", 
        status: "pending", 
        date: "Tahmini: Nisan 2023",
        description: "Üniversite başvurularınız yapılacak.",
        icon: "🏛️"
      },
      { 
        id: 5, 
        name: "Kabul Gelenler", 
        status: "pending", 
        date: "Tahmini: Mayıs 2023",
        description: "Üniversiteden kabul mektubu bekleniyor.",
        icon: "📨"
      },
      { 
        id: 6, 
        name: "Vize Başvuru Aşaması", 
        status: "pending", 
        date: "Tahmini: Haziran 2023",
        description: "Vize başvurusu için hazırlık yapılacak.",
        icon: "📋"
      },
      { 
        id: 7, 
        name: "Süreç Aşaması", 
        status: "pending", 
        date: "Tahmini: Temmuz 2023",
        description: "Vize süreciniz devam ediyor.",
        icon: "⏳"
      },
      { 
        id: 8, 
        name: "Vize Randevusu Atananlar", 
        status: "pending", 
        date: "Tahmini: Ağustos 2023",
        description: "Vize randevunuz konsolosluktan alınacak.",
        icon: "🗓️"
      },
      { 
        id: 9, 
        name: "Vize Bekleme Aşaması", 
        status: "pending", 
        date: "Tahmini: Eylül 2023",
        description: "Vize başvurunuz yapıldı, sonuç bekleniyor.",
        icon: "⌛"
      },
      { 
        id: 10, 
        name: "Almanya Aşaması", 
        status: "pending", 
        date: "Tahmini: Ekim 2023",
        description: "Almanya'ya gidiş planlaması yapılacak.",
        icon: "✈️"
      },
      { 
        id: 11, 
        name: "BİTEN", 
        status: "pending", 
        date: "Tahmini: Kasım 2023",
        description: "Süreç tamamlandı.",
        icon: "🎓"
      }
    ];
    
    // Öğrenci verisi yoksa varsayılan aşamaları döndür
    if (!studentData || !studentData.systemDetails) {
      return {
        currentStage: 3,
        totalStages: 11,
        startDate: "10 Ocak 2023",
        estimatedCompletionDate: "15 Kasım 2023",
        progress: 27, // yüzde (3/11*100)
        stages: defaultStages
      };
    }
    
    // Öğrenci verisi varsa, öğrenci verilerine göre aşamaları güncelle
    const updatedStages = [...defaultStages];
    
    // Gelen aşama durumuna göre ilerleme durumunu güncelle
    const stage = studentData.systemDetails.stage;
    let currentStage = 3; // Varsayılan aşama
    let progress = 42;    // Varsayılan ilerleme
    
    // Aşama durumlarını belirleme
    const stageMapping: {[key: string]: number} = {
      'Hazırlık Aşaması': 1,
      'Ceviri Hazir': 2,
      'Ödeme Yapilacaklar': 3,
      'Üniversite Başvurusu Yapılanlar': 4,
      'Kabul Gelenler': 5,
      'Vize Başvuru Aşaması': 6,
      'Süreç Aşaması': 7,
      'Vize Randevusu Atananlar': 8,
      'Vize Bekleme Aşaması': 9,
      'Almanya Aşaması': 10,
      'BİTEN': 11
    };
    
    // Öğrencinin mevcut aşamasını al
    const currentStageNumber = stageMapping[stage] || 3; // Varsayılan olarak 3. aşama
    
    if (stage === 'BİTEN') {
      // Süreç tamamlandıysa tüm aşamaları tamamlandı olarak işaretle
      currentStage = 11;
      progress = 100;
      
      updatedStages.forEach((s, index) => {
        updatedStages[index].status = "completed";
        
        // Tamamlanma tarihini güncelle
        if (index === 10) { // Son aşama için
          updatedStages[index].date = studentData.systemDetails.lastUpdateTime || "Tamamlandı";
          updatedStages[index].description = "Süreciniz başarıyla tamamlandı. Tebrikler!";
        }
      });
    } else {
      // Mevcut aşamaya kadar olan tüm aşamaları tamamlanmış olarak işaretle
      currentStage = currentStageNumber;
      progress = Math.round((currentStageNumber / 11) * 100);
      
      // Önceki aşamaları tamamlanmış olarak işaretle
      for (let i = 0; i < currentStageNumber - 1; i++) {
        if (i < updatedStages.length) {
          updatedStages[i].status = "completed";
        }
      }
      
      // Mevcut aşamayı "in-progress" olarak işaretle
      if (currentStageNumber - 1 < updatedStages.length) {
        updatedStages[currentStageNumber - 1].status = "in-progress";
        
        // Vize randevusu bilgisini ekle (eğer 8. aşamadaysa)
        if (currentStageNumber === 8 && studentData.visa && studentData.visa.appointmentDate) {
          updatedStages[7].date = `Randevu: ${studentData.visa.appointmentDate}`;
          updatedStages[7].description = `Vize randevunuz ${studentData.visa.appointmentDate} tarihine alındı. ${studentData.visa.consulate ? studentData.visa.consulate+' konsolosluğunda' : 'Konsoloslukta'} olacak.`;
        }
      }
    }
    
    return {
      currentStage,
      totalStages: 11,
      startDate: studentData.systemDetails.lastUpdated || "10 Ocak 2023",
      estimatedCompletionDate: "15 Kasım 2023",
      progress, 
      stages: updatedStages
    };
  }, [studentData]);

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

          {/* Durum Bildirimi */}
          {studentData?.systemDetails?.isUpdated && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800/30 
                         rounded-lg p-4 shadow-sm mb-6 flex items-start"
            >
              <div className="rounded-full bg-success-100 dark:bg-success-800/50 p-2 mr-3 text-success-700 dark:text-success-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-success-900 dark:text-success-200">
                  Otomatik Güncellenme
                </h3>
                <p className="text-success-800 dark:text-success-300 mt-1">
                  Başvuru süreciniz <span className="font-bold">{studentData.systemDetails.stage}</span> durumuna güncellendi.
                  {studentData.systemDetails.lastUpdateTime && (
                    <span className="block text-sm mt-1">Güncelleme tarihi: {studentData.systemDetails.lastUpdateTime}</span>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Süreç İlerleme Aşamaları */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Genel Süreç Durumu</h2>
            
            <div className="relative">
              {/* İlerleme çubuğu */}
              <div className="absolute left-7 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-600 z-0"></div>
              
              {/* Aşamalar */}
              <div className="space-y-8 relative z-10">
                {processData.stages.map((step) => (
                  <div key={step.id} className="flex">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'in-progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
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
                            step.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                            step.status === 'in-progress' ? 'text-blue-700 dark:text-blue-400' :
                            'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.name}
                          </h3>
                          <p className="text-default mt-1">{step.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          step.status === 'completed' ? 'bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          step.status === 'in-progress' ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
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
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30">
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Yapılacaklar</h2>
            
            <div className="space-y-3">
              {studentData?.systemDetails?.stage === 'BİTEN' ? (
                <div className="flex items-center p-3 border border-green-200/70 bg-green-50/70 dark:bg-green-900/20 dark:border-green-700/30 rounded-md">
                  <span className="text-green-500 mr-3 text-lg">✅</span>
                  <span className="text-default">Tüm işlemleriniz tamamlandı! Tebrikler.</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center p-3 border border-yellow-200/70 bg-yellow-50/70 dark:bg-yellow-900/20 dark:border-yellow-700/30 rounded-md">
                    <span className="text-yellow-500 mr-3 text-lg">⚠️</span>
                    <span className="text-default">Eksik belgeleri 1 hafta içinde yükleyin</span>
                  </div>
                  
                  {studentData?.visa?.appointmentDate ? (
                    <div className="flex items-center p-3 border border-green-200/70 bg-green-50/70 dark:bg-green-900/20 dark:border-green-700/30 rounded-md">
                      <span className="text-green-500 mr-3 text-lg">🗓️</span>
                      <span className="text-default">
                        Vize randevunuz {studentData.visa.appointmentDate} tarihinde 
                        {studentData.visa.consulate && ` ${studentData.visa.consulate} konsolosluğunda`}.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 border border-blue-200/70 bg-blue-50/70 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-md">
                      <span className="text-blue-500 mr-3 text-lg">📝</span>
                      <span className="text-default">Vize randevusu için danışmanınızla iletişime geçin</span>
                    </div>
                  )}
                </>
              )}
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