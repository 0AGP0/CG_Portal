"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

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

// Örnek kullanıcı bilgileri
const userData = {
  name: "Ahmet Yılmaz",
  email: "ahmet.yilmaz@example.com",
  profileImage: "https://placehold.co/100x100/ffc105/002757?text=AY",
  university: "Berlin Technical University",
  program: "Computer Science",
  studentId: "BTU2023921",
  counselor: "Ayşe Demir",
  lastLogin: "22 Nisan 2023, 14:30",
  alerts: [
    { id: 1, type: "success", message: "Vize randevunuz onaylandı." },
    { id: 2, type: "warning", message: "2 adet beklenen doküman yüklemeniz gerekiyor." }
  ]
};

export default function Dashboard() {
  const { user, startProcess, resetProcess } = useAuth();

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
              Hoş Geldin, <span className="text-[#ff9900]">{userData.name}</span>
            </h1>
            <p className="text-default mt-1">
              Başvuru sürecinizi takip etmek için sol menüden ilgili paneli seçebilirsiniz.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Süreç Başlatma Test Butonu */}
            {user && !user.processStarted && (
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
            )}

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
            {user && (
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
            )}
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
            {userData.alerts.map(alert => (
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
                src={userData.profileImage} 
                alt={userData.name} 
                className="w-16 h-16 rounded-full border-2 border-[#ffc105]"
              />
              <div>
                <h2 className="text-xl font-semibold text-[#002757]">{userData.name}</h2>
                <p className="text-default">{userData.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Öğrenci ID:</span>
                <span className="font-semibold text-[#002757]">{userData.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Danışman:</span>
                <span className="font-semibold text-[#002757]">{userData.counselor}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted font-medium">Son Giriş:</span>
                <span className="font-semibold text-[#002757]">{userData.lastLogin}</span>
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
                <span className="font-semibold text-[#002757]">{userData.university}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted font-medium">Program:</span>
                <span className="font-semibold text-[#002757]">{userData.program}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted font-medium">Durum:</span>
                <span className="font-semibold text-green-600">Kabul Edildi</span>
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
        </motion.div>
      </motion.div>
    </Layout>
  );
} 