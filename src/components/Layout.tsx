"use client";

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type LayoutProps = {
  children: ReactNode;
};

// Animasyon varyantları
const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -300, opacity: 0 }
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#002757] text-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logo-placeholder.svg" 
              alt="Campus Global Logo" 
              className="h-8 w-auto mr-2"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/200x80/ffc105/002757?text=Campus+Global';
              }}
            />
            <h1 className="text-xl font-bold">Campus Global Portal</h1>
          </div>
          
          {/* Mobil hamburger menü */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Masaüstü navigasyon */}
          <div className="hidden md:flex gap-6">
            <Link href="/dashboard" className="hover:text-[#ffc105] transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[#ffc105] transition-colors">
              Giriş Yap
            </Link>
            <Link href="/register" className="hover:text-[#ffc105] transition-colors">
              Kayıt Ol
            </Link>
            <Link href="#" className="bg-[#ffc105] text-[#002757] px-3 py-1 rounded-full hover:bg-opacity-90 transition-colors">
              Çıkış
            </Link>
          </div>
        </div>
        
        {/* Mobil menü */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex flex-col gap-3"
          >
            <Link href="/dashboard" className="py-2 hover:bg-blue-800 px-2 rounded">
              Dashboard
            </Link>
            <Link href="/login" className="py-2 hover:bg-blue-800 px-2 rounded">
              Giriş Yap
            </Link>
            <Link href="/register" className="py-2 hover:bg-blue-800 px-2 rounded">
              Kayıt Ol
            </Link>
            <Link href="#" className="py-2 bg-[#ffc105] text-[#002757] px-2 rounded">
              Çıkış
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/dashboard', label: 'Genel Bakış', icon: '🏠' },
    { path: '/dashboard/process', label: 'Süreç Durumu', icon: '⏱️' },
    { path: '/dashboard/visa', label: 'Vize Bilgileri', icon: '🛂' },
    { path: '/dashboard/education', label: 'Eğitim Bilgisi', icon: '🎓' },
    { path: '/dashboard/documents', label: 'Dokümanlar', icon: '📄' },
    { path: '/dashboard/applications', label: 'Başvurular', icon: '📝' },
    { path: '/dashboard/offers', label: 'Teklifler', icon: '🏆' },
  ];

  return (
    <motion.div 
      className="bg-white shadow-lg border-r"
      variants={sidebarVariants}
      initial="open"
      animate={isCollapsed ? "closed" : "open"}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className={`text-[#002757] font-bold ${isCollapsed ? 'hidden' : 'block'}`}>Paneller</h2>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">© 2023 Campus Global. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="#" className="text-sm text-gray-600 hover:text-[#002757]">
              Gizlilik Politikası
            </Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-[#002757]">
              Kullanım Şartları
            </Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-[#002757]">
              İletişim
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 