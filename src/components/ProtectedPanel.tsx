"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ProtectedPanelProps {
  children: ReactNode;
  panelName: string; // Panel adı (örn: "Süreç Durumu", "Vize Bilgileri" vb.)
}

const ProtectedPanel = ({ children, panelName }: ProtectedPanelProps) => {
  const { user } = useAuth();

  // Kullanıcı yoksa veya süreci başlamamışsa koruma göster
  const showProtection = !user?.processStarted;

  if (!showProtection) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Orijinal içerik, bulanıklaştırılmış olarak arka planda gösterilir */}
      <div className="blur-md pointer-events-none">
        {children}
      </div>

      {/* Koruma katmanı */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 p-6"
      >
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[#002757] mb-2">
            {panelName} Paneline Erişim Kısıtlı
          </h2>
          <p className="text-default mb-6">
            Bu içeriği görüntüleyebilmek için öncelikle Campus Global ile iletişime geçerek sürecinizi başlatmanız gerekmektedir.
          </p>
          <div className="space-y-3">
            <Link 
              href="/dashboard"
              className="btn-secondary w-full block"
            >
              Genel Bakış'a Dön
            </Link>
            <button 
              className="btn-primary w-full"
              onClick={() => {
                // Gerçek senaryoda iletişim formunu göster veya iletişim sayfasına yönlendir
                window.open('mailto:info@campusglobal.com.tr?subject=Süreç Başlatma Talebi', '_blank');
              }}
            >
              İletişime Geç
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProtectedPanel; 