"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  processStarted: boolean; // Süreç başlatılmış mı?
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  startProcess: () => void; // Süreci başlatma fonksiyonu
  resetProcess: () => void; // Süreci sıfırlama fonksiyonu
}

// Başlangıç değerleri
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  startProcess: () => {},
  resetProcess: () => {}
};

// Context'i oluştur
const AuthContext = createContext<AuthContextType>(defaultContext);

// Custom hook
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    // Gerçek uygulamada bu kısım localStorage, cookie veya API kullanabilir
    // Şimdilik mock veri kullanacağız
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Demo için her uygulama başlatıldığında süreç başlamamış olarak ayarla
        const parsedUser = JSON.parse(storedUser);
        const resetUser = { ...parsedUser, processStarted: false };
        setUser(resetUser);
        localStorage.setItem('user', JSON.stringify(resetUser));
      } else {
        // Demo için otomatik kullanıcı oluştur
        const demoUser: User = {
          id: '1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet.yilmaz@example.com',
          processStarted: false // Demo için süreci başlamamış olarak ayarla
        };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Giriş işlemi
  const login = async (email: string, password: string) => {
    // Gerçek uygulamada API çağrısı yapılacak
    // Şimdilik mock giriş işlemi
    setIsLoading(true);
    
    // Mock API çağrısı simülasyonu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: email,
      processStarted: false // Giriş yapan kullanıcının süreci başlamamış durumda
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  // Çıkış işlemi
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Süreci başlatma işlemi
  const startProcess = () => {
    if (user) {
      const updatedUser = { ...user, processStarted: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Süreci sıfırlama işlemi
  const resetProcess = () => {
    if (user) {
      const updatedUser = { ...user, processStarted: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    startProcess,
    resetProcess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 