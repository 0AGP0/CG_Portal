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

// Aşama tipleri
type StageKey = 
  | 'Hazırlık Aşaması'
  | 'Çeviri Hazır'
  | 'Üniversite Başvurusu Yapıldı'
  | 'Kabul Geldi'
  | 'Vize Başvuru Aşaması'
  | 'Süreç Aşaması'
  | 'Vize Randevusu Atandı'
  | 'Vize Bekleme Aşaması'
  | 'Almanya Aşaması'
  | 'Süreç Tamamlandı';

interface StageDescription {
  description: string;
  documents?: string[];
}

// Aşama açıklamaları
const stageDescriptions: Record<StageKey, StageDescription> = {
  'Hazırlık Aşaması': {
    description: 'Bu aşamada başvuru için gerekli belgelerinizi hazırlamanız gerekiyor. Aşağıdaki belgeleri yüklemeniz gerekecek:',
    documents: [
      'Lise diploması',
      'Transkript',
      'Pasaport',
      'CV',
      'Motivasyon mektubu'
    ]
  },
  'Çeviri Hazır': {
    description: 'Belgeleriniz çeviri için hazırlanıyor. Bu süreçte herhangi bir belge yüklemenize gerek yok.'
  },
  'Üniversite Başvurusu Yapıldı': {
    description: 'Üniversite başvurularınız yapılıyor. Başvuru sonuçlarını beklerken herhangi bir belge yüklemenize gerek yok.'
  },
  'Kabul Geldi': {
    description: 'Üniversiteden kabul mektubunuz geldi. Vize başvurusu için hazırlıklara başlayacağız.'
  },
  'Vize Başvuru Aşaması': {
    description: 'Vize başvurusu için gerekli belgeleri hazırlamanız gerekiyor. Aşağıdaki belgeleri yüklemeniz gerekecek:',
    documents: [
      'Kabul mektubu',
      'Finansal belgeler',
      'Sağlık sigortası',
      'Konaklama belgesi'
    ]
  },
  'Süreç Aşaması': {
    description: 'Vize başvuru süreciniz devam ediyor. Konsolosluk randevusu için hazırlık yapılıyor.'
  },
  'Vize Randevusu Atandı': {
    description: 'Vize randevunuz atandı. Randevu tarihinize kadar gerekli belgelerinizi hazır tutun.'
  },
  'Vize Bekleme Aşaması': {
    description: 'Vize başvurunuz yapıldı. Konsolosluktan sonuç bekleniyor.'
  },
  'Almanya Aşaması': {
    description: 'Vizeniz onaylandı. Almanya\'ya gidiş planlaması yapılıyor.'
  },
  'Süreç Tamamlandı': {
    description: 'Tebrikler! Tüm süreç başarıyla tamamlandı.'
  }
};

export default function ProcessPanel() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState(1);
  const [normalizedStage, setNormalizedStage] = useState<StageKey>('Hazırlık Aşaması');

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
            const stageMapping: Record<string, number> = {
              'Hazırlık Aşaması': 1,
              'Çeviri Hazır': 2,
              'Üniversite Başvurusu Yapıldı': 3,
              'Kabul Geldi': 4,
              'Vize Başvuru Aşaması': 5,
              'Süreç Aşaması': 6,
              'Vize Randevusu Atandı': 7,
              'Vize Bekleme Aşaması': 8,
              'Almanya Aşaması': 9,
              'Süreç Tamamlandı': 10
            };
            
            // Öğrencinin mevcut aşamasını al ve normalize et
            const stage = data.student?.stage;
            let newNormalizedStage: StageKey = 'Hazırlık Aşaması';
            
            // Eski aşama isimlerini yeni isimlere dönüştür
            if (stage === 'Ceviri Hazir') newNormalizedStage = 'Çeviri Hazır';
            else if (stage === 'Üniversite Başvurusu Yapılanlar') newNormalizedStage = 'Üniversite Başvurusu Yapıldı';
            else if (stage === 'Kabul Gelenler') newNormalizedStage = 'Kabul Geldi';
            else if (stage === 'Vize Randevusu Atananlar') newNormalizedStage = 'Vize Randevusu Atandı';
            else if (stage === 'BİTEN') newNormalizedStage = 'Süreç Tamamlandı';
            else if (stage in stageMapping) newNormalizedStage = stage as StageKey;
            
            setNormalizedStage(newNormalizedStage);
            
            // Aşama numarasını belirle
            const stageNumber = stageMapping[newNormalizedStage] || 1;
            setExpandedStage(stageNumber);
            
            // Debug için log
            console.log('Öğrenci Aşama Bilgisi:', {
              originalStage: stage,
              normalizedStage: newNormalizedStage,
              stageNumber,
              studentData: data.student,
              stageDescription: stageDescriptions[newNormalizedStage]
            });
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
        status: "pending", 
        date: "Başlangıç",
        description: "Başvuru sürecinizin hazırlık aşaması başladı.",
        icon: "📝"
      },
      { 
        id: 2, 
        name: "Çeviri Hazır", 
        status: "pending", 
        date: "Bekliyor",
        description: "Belgelerinizin çevirileri yapılacak.",
        icon: "📄"
      },
      { 
        id: 3, 
        name: "Üniversite Başvurusu Yapıldı", 
        status: "pending", 
        date: "Bekliyor",
        description: "Üniversite başvurularınız yapılacak.",
        icon: "🏛️"
      },
      { 
        id: 4, 
        name: "Kabul Geldi", 
        status: "pending", 
        date: "Bekliyor",
        description: "Üniversiteden kabul mektubu bekleniyor.",
        icon: "📨"
      },
      { 
        id: 5, 
        name: "Vize Başvuru Aşaması", 
        status: "pending", 
        date: "Bekliyor",
        description: "Vize başvurusu için hazırlık yapılacak.",
        icon: "📋"
      },
      { 
        id: 6, 
        name: "Süreç Aşaması", 
        status: "pending", 
        date: "Bekliyor",
        description: "Vize süreciniz devam edecek.",
        icon: "⏳"
      },
      { 
        id: 7, 
        name: "Vize Randevusu Atandı", 
        status: "pending", 
        date: "Bekliyor",
        description: "Vize randevunuz konsolosluktan alınacak.",
        icon: "🗓️"
      },
      { 
        id: 8, 
        name: "Vize Bekleme Aşaması", 
        status: "pending", 
        date: "Bekliyor",
        description: "Vize başvurunuz yapılacak, sonuç bekleniyor.",
        icon: "⌛"
      },
      { 
        id: 9, 
        name: "Almanya Aşaması", 
        status: "pending", 
        date: "Bekliyor",
        description: "Almanya'ya gidiş planlaması yapılacak.",
        icon: "✈️"
      },
      { 
        id: 10, 
        name: "Süreç Tamamlandı", 
        status: "pending", 
        date: "Bekliyor",
        description: "Süreç tamamlanacak.",
        icon: "🎓"
      }
    ];
    
    // Öğrenci verisi yoksa varsayılan aşamaları döndür
    if (!studentData || !studentData.stage) {
      return {
        currentStage: 1,
        totalStages: 10,
        startDate: "Başlangıç",
        estimatedCompletionDate: "Tahmin edilemiyor",
        progress: 0,
        stages: defaultStages
      };
    }
    
    // Öğrenci verisi varsa, öğrenci verilerine göre aşamaları güncelle
    const updatedStages = [...defaultStages];
    
    // Gelen aşama durumuna göre ilerleme durumunu güncelle
    const stage = studentData.stage;
    let normalizedStage = stage;
    
    // Eski aşama isimlerini yeni isimlere dönüştür
    if (stage === 'Ceviri Hazir') normalizedStage = 'Çeviri Hazır';
    if (stage === 'Üniversite Başvurusu Yapılanlar') normalizedStage = 'Üniversite Başvurusu Yapıldı';
    if (stage === 'Kabul Gelenler') normalizedStage = 'Kabul Geldi';
    if (stage === 'Vize Randevusu Atananlar') normalizedStage = 'Vize Randevusu Atandı';
    if (stage === 'BİTEN') normalizedStage = 'Süreç Tamamlandı';
    
    // Aşama durumlarını belirleme
    const stageMapping: {[key: string]: number} = {
      'Hazırlık Aşaması': 1,
      'Çeviri Hazır': 2,
      'Üniversite Başvurusu Yapıldı': 3,
      'Kabul Geldi': 4,
      'Vize Başvuru Aşaması': 5,
      'Süreç Aşaması': 6,
      'Vize Randevusu Atandı': 7,
      'Vize Bekleme Aşaması': 8,
      'Almanya Aşaması': 9,
      'Süreç Tamamlandı': 10
    };
    
    // Öğrencinin mevcut aşamasını al
    const currentStageNumber = stageMapping[normalizedStage] || 1;
    let currentStage = currentStageNumber;
    let progress = Math.round((currentStageNumber / 10) * 100);
    
    // Debug için log
    console.log('Süreç Durumu Hesaplama:', {
      originalStage: stage,
      normalizedStage,
      currentStageNumber,
      progress
    });
    
    if (normalizedStage === 'Süreç Tamamlandı') {
      // Süreç tamamlandıysa tüm aşamaları tamamlandı olarak işaretle
      currentStage = 10;
      progress = 100;
      
      updatedStages.forEach((s, index) => {
        updatedStages[index].status = "completed";
        
        // Tamamlanma tarihini güncelle
        if (index === 9) { // Son aşama için
          updatedStages[index].date = studentData.updated_at || "Tamamlandı";
          updatedStages[index].description = "Süreciniz başarıyla tamamlandı. Tebrikler!";
        }
      });
    } else {
      // Mevcut aşamaya kadar olan tüm aşamaları tamamlanmış olarak işaretle
      for (let i = 0; i < currentStageNumber - 1; i++) {
        if (i < updatedStages.length) {
          updatedStages[i].status = "completed";
          updatedStages[i].date = "Tamamlandı";
        }
      }
      
      // Mevcut aşamayı "in-progress" olarak işaretle
      if (currentStageNumber - 1 < updatedStages.length) {
        updatedStages[currentStageNumber - 1].status = "in-progress";
        updatedStages[currentStageNumber - 1].date = "Devam Ediyor";
        
        // Vize randevusu bilgisini ekle (eğer 7. aşamadaysa)
        if (currentStageNumber === 7 && studentData.visa_appointment_date) {
          updatedStages[6].date = `Randevu: ${studentData.visa_appointment_date}`;
          updatedStages[6].description = `Vize randevunuz ${studentData.visa_appointment_date} tarihine alındı. ${studentData.visa_consulate ? studentData.visa_consulate+' konsolosluğunda' : 'Konsoloslukta'} olacak.`;
        }
      }
    }
    
    return {
      currentStage,
      totalStages: 10,
      startDate: studentData.created_at || "Başlangıç",
      estimatedCompletionDate: "Tahmin edilemiyor",
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
            
            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
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

            {/* Mobil Timeline - Dikey Liste */}
            <div className="md:hidden">
              <div className="space-y-4">
                {processData.stages.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {/* Aşama ikonu */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${step.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                        step.status === 'in-progress' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
                        'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : step.status === 'in-progress' ? (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{step.id}</span>
                      )}
                    </div>
                    
                    {/* Aşama bilgileri */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${
                        step.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                        step.status === 'in-progress' ? 'text-blue-700 dark:text-blue-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Durum badge */}
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        step.status === 'completed' ? 'bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        step.status === 'in-progress' ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-gray-100/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                      }`}>
                        {step.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobilde mevcut aşama bilgisi */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Mevcut Aşama:</strong> {processData.stages.find(s => s.status === 'in-progress')?.name || 'Hazırlık Aşaması'}
                </p>
              </div>
            </div>
          </div>

          {/* Yapılacaklar Alanı */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Yapılacaklar
            </h3>
            
            {studentData?.stage && (
              <div className="space-y-4">
                {/* Aşama Açıklaması */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {stageDescriptions[normalizedStage]?.description || 'Bu aşamada yapmanız gereken işlemler bulunmuyor.'}
                  </p>
                </div>

                {/* Belge Yükleme Bildirimi - Sadece Hazırlık ve Vize Başvuru aşamalarında göster */}
                {(normalizedStage === 'Hazırlık Aşaması' || normalizedStage === 'Vize Başvuru Aşaması') && 
                 stageDescriptions[normalizedStage]?.documents && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yüklemeniz Gereken Belgeler:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {stageDescriptions[normalizedStage].documents?.map((doc: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {doc}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <Link
                        href="/dashboard/documents"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Belgeleri Yükle
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </ProtectedPanel>
    </Layout>
  );
} 