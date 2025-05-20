"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useUnreadMessagesCount } from '@/hooks/useData';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
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

export default function Dashboard() {
  const { user, startProcess, resetProcess } = useAuth();
  const { unreadCount } = useUnreadMessagesCount();
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);
  
  useEffect(() => {
    // Kullanıcı verilerini API'den çek
    const fetchUserData = async () => {
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
          } else {
            // API'den veri gelmezse default gösterilecek veriler
            setStudentData({
              name: user.name,
              email: user.email,
              studentId: "Not Available",
              university: "Not Available",
              program: "Not Available",
              counselor: "Not Available",
              lastLogin: new Date().toLocaleDateString('tr-TR'),
              alerts: [
                { id: 1, type: 'warning', message: 'Profilinizi tamamlamanız gerekiyor.' }
              ]
            });
          }
        }
      } catch (error) {
        console.error('Kullanıcı verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  if (!user || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Kullanıcı verileri
  const userData = studentData ? {
    name: studentData.name || user.name,
    email: studentData.email || user.email,
    // Profil resmi için kullanıcı adının baş harflerini al
    profileImage: `https://placehold.co/100x100/ffc105/002757?text=${(studentData.name || user.name).split(' ').map((n: string) => n[0]).join('')}`,
    university: studentData.university || "Henüz Belirlenmedi",
    program: studentData.program || "Henüz Belirlenmedi",
    studentId: studentData.studentId || "Henüz Belirlenmedi",
    counselor: studentData.counselor || "Henüz Atanmadı",
    salesPerson: studentData.salesPerson || "Henüz Atanmadı",
    lastLogin: studentData.lastLogin || new Date().toLocaleDateString('tr-TR'),
    alerts: studentData.alerts || [
      { id: 1, type: 'warning', message: 'Profilinizi tamamlamanız gerekiyor.' }
    ]
  } : null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002757]">
              Hoş Geldin, <span className="text-[#ff9900]">{userData?.name}</span>
            </h1>
            <p className="text-default mt-1">
              Başvuru sürecinizi takip etmek için sol menüden ilgili paneli seçebilirsiniz.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Süreç Başlatma Test Butonu - Artık aktif değil */}
            {/* {user && !user.processStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <button 
                  onClick={startProcess}
                  className="btn-primary flex items-center gap-2"
                >
                  <span>Süreci Başlat</span>
                  <span className="text-lg">🚀</span>
                </button>
              </motion.div>
            )} */}

            {/* Süreç Başlatılmış Durumu */}
            {user && user.processStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>Süreciniz Başlatıldı</span>
                </div>
              </motion.div>
            )}
            
            {/* TEST İÇİN: Süreci Sıfırlama Butonu - Bu normalde gerçek uygulamada olmayacak */}
            {/* {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <button 
                  onClick={resetProcess}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span>Süreci Sıfırla (Test)</span>
                  <span className="text-lg">🔄</span>
                </button>
              </motion.div>
            )} */}
          </div>
        </div>

        {/* Uyarılar ve Bildirimler */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
            Bildirimler ve Uyarılar
          </h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {userData?.alerts?.map((alert: any) => (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className={`p-4 rounded-lg shadow-sm border-l-4 ${
                  alert.type === 'success' ? 'border-green-500 bg-green-50' : 
                  alert.type === 'warning' ? 'border-[#ffc105] bg-yellow-50' : 
                  'border-[#e00000] bg-red-50'
                }`}
              >
                <p className="text-gray-800 font-medium">{alert.message}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Kullanıcı Profil Özeti */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={userData?.profileImage} 
                alt={userData?.name} 
                className="w-16 h-16 rounded-full border-2 border-[#ffc105]"
              />
              <div>
                <h2 className="text-xl font-semibold text-[#002757]">{userData?.name}</h2>
                <p className="text-default">{userData?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Öğrenci ID:</span>
                <span className="font-semibold text-[#002757]">{userData?.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Danışman:</span>
                <span className="font-semibold text-[#002757]">{userData?.counselor}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Satış Ekibi:</span>
                <span className="font-semibold text-[#002757]">{userData?.salesPerson}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted font-medium">Son Giriş:</span>
                <span className="font-semibold text-[#002757]">{userData?.lastLogin}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#002757]">Eğitim Bilgileri</h2>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Üniversite:</span>
                <span className="font-semibold text-[#002757]">{userData?.university}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Program:</span>
                <span className="font-semibold text-[#002757]">{userData?.program}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted font-medium">Durum:</span>
                <span className="font-semibold text-green-600">
                  {user.processStarted ? 'Aktif' : 'Henüz Başlatılmadı'}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                href="/dashboard/education" 
                className="btn-secondary inline-block w-full text-center"
              >
                Detaylı Eğitim Bilgilerim
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hızlı Erişim Kartları */}
        <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
          Hızlı Erişim
        </h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/process" className="block">
              <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-[#002757] h-full">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="font-semibold text-lg mb-1">Süreç Durumu</h3>
                <p className="text-default text-sm">Başvuru sürecinizin güncel durumunu görüntüleyin</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/visa" className="block">
              <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-[#ffc105] h-full">
                <div className="text-2xl mb-2">🛂</div>
                <h3 className="font-semibold text-lg mb-1">Vize Bilgileri</h3>
                <p className="text-gray-600 text-sm">Vize başvurunuzun detayları ve gerekli belgeler</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/documents" className="block">
              <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-[#ff9900] h-full">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="font-semibold text-lg mb-1">Dokümanlar</h3>
                <p className="text-gray-600 text-sm">Tüm belgelerinizi görüntüleyin ve yeni belgeler yükleyin</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/messages" className="block">
              <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border-t-4 border-[#4CAF50] h-full">
                <div className="flex justify-between">
                  <div className="text-2xl mb-2">💬</div>
                  {unreadCount > 0 && (
                    <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">Mesajlarım</h3>
                <p className="text-gray-600 text-sm">Danışmanınızla iletişime geçin ve sorularınızı sorun</p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
} 