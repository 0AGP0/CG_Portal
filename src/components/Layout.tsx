"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from '@/components/NotificationCenter';

type LayoutProps = {
  children: ReactNode;
};

// Animasyon varyantları
const sidebarVariants = {
  open: { 
    width: '280px',
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    } 
  },
  closed: { 
    width: '80px',
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    } 
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    } 
  }
};

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = () => user?.role === 'admin';
  const isAdvisor = () => user?.role === 'advisor';
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-lg shadow-md'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg rotate-6 opacity-80 animate-pulse-light"></div>
                <div className="relative z-10 text-white font-bold text-xl">CG</div>
          </div>
              <span className="font-heading font-bold text-xl text-gray-800 dark:text-white">
                Campus<span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent ml-1">Global</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {user.role === 'student' && <NotificationCenter />}
                
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900">
                      <span className="font-bold text-sm">
                        {user.name?.substring(0, 2).toUpperCase() || 'CG'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">
                      {user.name || 'Kullanıcı'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      {isAdmin() ? 'Admin' : isAdvisor() ? 'Danışman' : 'Öğrenci'}
                </span>
                  </div>
                </div>
                
                {isAdmin() && (
                  <nav className="flex items-center gap-1">
                <Link 
                      href="/admin" 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/admin' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                >
                  Dashboard
                </Link>
                    <Link 
                      href="/admin/students" 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/admin/students' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      Öğrenciler
                    </Link>
                    <Link 
                      href="/admin/advisors" 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/admin/advisors' 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      Danışmanlar
                    </Link>
                  </nav>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all
                    bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 
                    text-white shadow-sm hover:shadow-md"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-lg text-sm font-medium 
                    bg-white text-primary-600 shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200"
                >
                  Giriş
                </Link>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full"
          >
            <div className={`relative w-6 transition-all ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
              <span className={`block absolute h-0.5 rounded-full w-6 bg-gray-700 dark:bg-gray-200 transition-all ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
              }`}></span>
              <span className={`block absolute h-0.5 rounded-full w-6 bg-gray-700 dark:bg-gray-200 transition-all ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`block absolute h-0.5 rounded-full w-6 bg-gray-700 dark:bg-gray-200 transition-all ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
              }`}></span>
            </div>
          </button>
        </div>
        
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/30 md:hidden"
            >
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900">
                          <span className="font-bold text-sm">
                            {user.name?.substring(0, 2).toUpperCase() || 'CG'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {user.name || 'Kullanıcı'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isAdmin() ? 'Admin' : isAdvisor() ? 'Danışman' : 'Öğrenci'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobil menü öğeleri - Kullanıcı rolüne göre */}
                    <div className="space-y-2">
                      {user && isAdmin() ? (
                        // Admin menü öğeleri
                        <>
                          <Link 
                            href="/admin"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Öğrenciler
                          </Link>
                          <Link 
                            href="/admin/advisors"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Danışmanlar
                          </Link>
                          <Link 
                            href="/admin/test"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Test
                          </Link>
                        </>
                      ) : user && isAdvisor() ? (
                        // Danışman menü öğeleri
                        <>
                          <Link 
                            href="/advisor/dashboard"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Dashboard
                          </Link>
                          <Link 
                            href="/advisor/students"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Öğrencilerim
                          </Link>
                          <Link 
                            href="/advisor/messages"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Mesajlar
                          </Link>
                          <Link 
                            href="/advisor/documents"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Dokümanlar
                          </Link>
                        </>
                      ) : (
                        // Öğrenci menü öğeleri
                        <>
                          <Link 
                            href="/dashboard"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Genel Bakış
                          </Link>
                          <Link 
                            href="/dashboard/process"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Süreç Durumu
                          </Link>
                          <Link 
                            href="/dashboard/documents"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Dokümanlar
                          </Link>
                          <Link 
                            href="/dashboard/messages"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Mesajlarım
                          </Link>
                          <Link 
                            href="/dashboard/visa"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Vize Bilgileri
                          </Link>
                          <Link 
                            href="/dashboard/education"
                            className="block py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800/70 text-gray-800 dark:text-white text-sm font-medium"
                          >
                            Kişisel Bilgiler
                          </Link>
                        </>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleLogout}
                      className="py-2 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium shadow-sm"
                    >
                      Çıkış
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="py-3 px-4 rounded-xl bg-white text-primary-600 text-sm font-medium shadow-sm border border-gray-100"
                    >
                      Giriş
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </motion.header>
  );
};

// Icon bileşenleri
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const StudentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AdvisorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ProcessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ApplicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const EducationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const VisaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAdvisor, isAdmin } = useAuth();
  
  // Öğrenci için menü öğeleri
  const studentMenuItems = [
    { path: '/dashboard', label: 'Genel Bakış', icon: <HomeIcon /> },
    { path: '/dashboard/process', label: 'Süreç Durumu', icon: <ProcessIcon /> },
    { path: '/dashboard/visa', label: 'Vize Bilgileri', icon: <VisaIcon /> },
    { path: '/dashboard/education', label: 'Kişisel Bilgiler', icon: <EducationIcon /> },
    { path: '/dashboard/documents', label: 'Dokümanlar', icon: <DocumentIcon /> },
    { path: '/dashboard/applications', label: 'Başvurular', icon: <ApplicationIcon /> },
    { path: '/dashboard/messages', label: 'Mesajlarım', icon: <MessageIcon /> },
  ];
  
  // Danışman için menü öğeleri
  const advisorMenuItems = [
    { path: '/advisor/dashboard', label: 'Genel Bakış', icon: <HomeIcon /> },
    { path: '/advisor/messages', label: 'Mesajlar', icon: <MessageIcon /> },
    { path: '/advisor/applications', label: 'Başvurular', icon: <ApplicationIcon /> },
    { path: '/advisor/documents', label: 'Dokümanlar', icon: <DocumentIcon /> },
    { path: '/advisor/reports', label: 'Raporlar', icon: <ReportIcon /> },
  ];

  // Admin için menü öğeleri
  const adminMenuItems = [
    { path: '/admin', label: 'Öğrenciler', icon: <StudentsIcon /> },
    { path: '/admin/advisors', label: 'Danışmanlar', icon: <AdvisorIcon /> },
  ];
  
  // Kullanıcının rolüne göre menüyü belirle
  const menuItems = user && isAdmin() 
    ? adminMenuItems
    : user && isAdvisor() 
      ? advisorMenuItems 
      : studentMenuItems;

  return (
    <motion.aside
      className={`fixed top-0 left-0 z-30 h-screen pt-20 overflow-hidden transition-all duration-300 ease-in-out bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-100 dark:border-gray-700/20 shadow-lg hidden md:block ${
        isCollapsed ? 'w-20' : 'w-[280px]'
      }`}
      layout
    >
      <div className="h-full flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <div className="px-3 py-4">
          <div className="flex items-center justify-between mb-6 px-2">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-base font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          {user && isAdmin() 
            ? 'Admin Paneli' 
            : user && isAdvisor() 
              ? 'Danışman Paneli' 
              : 'Öğrenci Paneli'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Hoş geldiniz, {user?.name?.split(' ')[0] || 'Kullanıcı'}
                </span>
              </motion.div>
            )}
            
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
                />
            </svg>
        </button>
      </div>
      
          <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
              
            return (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10">
                      {item.icon}
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <span className={`ml-3 text-sm font-medium transition-colors ${
                      isActive ? 'text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {item.label}
                  </span>
                  )}
                  
                  {isActive && !isCollapsed && (
                    <div className="ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400"></div>
                    </div>
                  )}
                </Link>
            );
          })}
          </div>
        </div>
        
        <div className="p-4 mt-auto">
          {!isCollapsed && (
            <div className="rounded-xl bg-gradient-to-r from-primary-50/80 to-accent-50/80 dark:from-primary-900/40 dark:to-accent-900/40 p-4 border border-primary-100/60 dark:border-primary-800/20 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Yardıma mı ihtiyacınız var?</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Bir sorunuz veya probleminiz mi var? Destek ekibimizle iletişime geçin.
              </p>
              <Link 
                href={user && isAdmin() ? '/admin/support' : '/dashboard/messages'} 
                className="block text-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg text-xs font-medium text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Destek Alın
              </Link>
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex justify-center">
              <Link 
                href={user && isAdmin() ? '/admin/support' : '/dashboard/messages'} 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

const Footer = () => {
  return (
    <footer className="relative z-10 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-4 border-t border-gray-200 dark:border-gray-700/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <p className="text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Campus Global. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Gizlilik</a>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">KVKK</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Mobil Bottom Navigation Bileşeni
const MobileBottomNav = () => {
  const pathname = usePathname();
  const { user, isAdvisor, isAdmin } = useAuth();
  
  // Öğrenci için mobil menü öğeleri
  const studentMenuItems = [
    { path: '/dashboard', label: 'Ana Sayfa', icon: <HomeIcon /> },
    { path: '/dashboard/process', label: 'Süreç', icon: <ProcessIcon /> },
    { path: '/dashboard/visa', label: 'Vize', icon: <VisaIcon /> },
    { path: '/dashboard/education', label: 'Kişisel', icon: <EducationIcon /> },
    { path: '/dashboard/documents', label: 'Dokümanlar', icon: <DocumentIcon /> },
    { path: '/dashboard/applications', label: 'Başvurular', icon: <ApplicationIcon /> },
    { path: '/dashboard/messages', label: 'Mesajlar', icon: <MessageIcon /> },
  ];
  
  // Danışman için mobil menü öğeleri
  const advisorMenuItems = [
    { path: '/advisor/dashboard', label: 'Ana Sayfa', icon: <HomeIcon /> },
    { path: '/advisor/students', label: 'Öğrenciler', icon: <StudentsIcon /> },
    { path: '/advisor/applications', label: 'Başvurular', icon: <ApplicationIcon /> },
    { path: '/advisor/documents', label: 'Dokümanlar', icon: <DocumentIcon /> },
    { path: '/advisor/messages', label: 'Mesajlar', icon: <MessageIcon /> },
    { path: '/advisor/reports', label: 'Raporlar', icon: <ReportIcon /> },
  ];

  // Admin için mobil menü öğeleri
  const adminMenuItems = [
    { path: '/admin', label: 'Öğrenciler', icon: <StudentsIcon /> },
    { path: '/admin/advisors', label: 'Danışmanlar', icon: <AdvisorIcon /> },
    { path: '/admin/test', label: 'Test', icon: <ReportIcon /> },
  ];
  
  // Kullanıcının rolüne göre menüyü belirle
  const menuItems = user && isAdmin() 
    ? adminMenuItems
    : user && isAdvisor() 
      ? advisorMenuItems 
      : studentMenuItems;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700/50 shadow-lg"
    >
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center px-4 py-2 min-w-max">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all flex-shrink-0 mx-1 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center mb-1 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-medium text-center ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Giriş yapmadıysa ve giriş sayfasında değilse, yalnızca header ve footer göster
  const isLoginPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';
  const showSidebar = user && !isLoginPage && !isLandingPage;
  
  // Sayfa türü kontrolleri
  const isAdminPage = pathname?.startsWith('/admin');
  const isAdvisorPage = pathname?.startsWith('/advisor');
  const isDashboardPage = pathname?.startsWith('/dashboard');
  
  // Herhangi bir özel sayfada mıyız? (admin, danışman veya öğrenci paneli)
  const isSpecialPage = isAdminPage || isAdvisorPage || isDashboardPage;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Dekoratif arka plan öğeleri */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-300/20 to-accent-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-gradient-to-br from-primary-300/20 to-primary-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-secondary-300/15 to-secondary-500/15 rounded-full blur-3xl"></div>
        <div className="hidden md:block absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-tr from-success-400/10 to-success-600/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      </div>
      
      <Header />
      
      <div className="flex flex-grow pt-18 relative z-10">
        {showSidebar && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Sidebar />
          </motion.div>
        )}
        
        <main className={`flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300 ${showSidebar ? 'md:ml-[280px]' : ''} pb-24 md:pb-8`}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto"
          >
            {isSpecialPage ? (
              // Admin, danışman veya öğrenci sayfaları için özel stil
              <div className="relative z-10 bg-transparent">
                {children}
              </div>
            ) : (
              // Diğer sayfalar için standart stil
              <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 p-6 md:p-8">
            {children}
              </div>
            )}
          </motion.div>
        </main>
      </div>
      
      <Footer />
      
      {/* Mobil Bottom Navigation */}
      {showSidebar && <MobileBottomNav />}
    </div>
  );
};

export default Layout; 