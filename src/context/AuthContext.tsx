"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'advisor' | 'admin'; // Kullanıcı tipi: öğrenci, danışman veya admin
  processStarted?: boolean; // Süreç başlatılmış mı? (sadece öğrenciler için)
  advisorId?: string; // Atanmış danışman ID'si (sadece öğrenciler için)
  studentIds?: string[]; // Danışmana atanmış öğrenciler (sadece danışmanlar için)
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'student' | 'advisor' | 'admin') => Promise<boolean>;
  logout: () => void;
  startProcess: () => void; // Süreci başlatma fonksiyonu
  resetProcess: () => void; // Süreci sıfırlama fonksiyonu
  isAdvisor: () => boolean; // Kullanıcının danışman olup olmadığını kontrol et
  isAdmin: () => boolean; // Kullanıcının admin olup olmadığını kontrol et
}

// Başlangıç değerleri
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  startProcess: () => {}, // Varsayılan boş fonksiyon
  resetProcess: () => {},
  isAdvisor: () => false,
  isAdmin: () => false
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
        // Eğer role tanımlı değilse, eski veri için student olarak varsay
        if (!parsedUser.role) {
          parsedUser.role = 'student';
        }
        // Öğrenci ise processStarted değerini kontrol et
        if (parsedUser.role === 'student') {
          parsedUser.processStarted = parsedUser.processStarted || false;
        }
        setUser(parsedUser);
        localStorage.setItem('user', JSON.stringify(parsedUser));
      } else {
        // Demo için otomatik kullanıcı oluşturmayalım
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Giriş işlemi - öğrenci, danışman veya admin girişi
  const login = async (email: string, password: string, role: 'student' | 'advisor' | 'admin' = 'student') => {
    setIsLoading(true);
    
    // Kullanıcı e-postasını localStorage'a kaydet (API istekleri için)
    localStorage.setItem('userEmail', email);
    
    // Gerçek uygulamada API çağrısı yapılacak
    // Şimdilik API'ye basit bir istek göndereceğiz
    
    try {
      if (role === 'advisor') {
        // Danışman girişi
        const response = await fetch('/api/auth/advisor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          throw new Error('Danışman girişi başarısız');
        }
        
        const data = await response.json();
        const advisor = data.advisor;
        
        // Eğer API'den veri gelmezse basit bir danışman nesnesi oluştur
        if (!advisor) {
          // İsim oluşturma - e-posta adresinden basit bir şekilde
          const nameParts = email.split('@')[0].split('.');
          const displayName = nameParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
          
          const mockAdvisor: User = {
            id: 'adv-1',
            name: displayName || 'Danışman Kullanıcı',
            email: email,
            role: 'advisor',
            studentIds: ['akifgiraypusat@gmail.com', 'burcu.shut@gmail.com']
          };
          
          setUser(mockAdvisor);
          localStorage.setItem('user', JSON.stringify(mockAdvisor));
        } else {
          // API'den gelen danışman bilgilerini kullan
          const advisorUser: User = {
            id: advisor.id,
            name: advisor.name,
            email: advisor.email,
            role: 'advisor',
            studentIds: advisor.studentIds || []
          };
          
          setUser(advisorUser);
          localStorage.setItem('user', JSON.stringify(advisorUser));
        }
        
        setIsLoading(false);
        return true;
      } else if (role === 'admin') {
        // Admin girişi
        try {
          // İsim oluşturma - e-posta adresinden basit bir şekilde
          const nameParts = email.split('@')[0].split('.');
          const displayName = nameParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
          
          const mockAdmin: User = {
            id: 'admin-1',
            name: displayName || 'Admin Kullanıcı',
            email: email,
            role: 'admin'
          };
          
          setUser(mockAdmin);
          localStorage.setItem('user', JSON.stringify(mockAdmin));
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error('Admin girişi hatası:', error);
          throw error;
        }
      } else {
        // Öğrenci girişi
        const response = await fetch('/api/auth/student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        if (!response.ok) {
          // API çağrısı başarısız olursa, mock veri oluştur
          // İsim oluşturma - e-posta adresinden basit bir şekilde
          const nameParts = email.split('@')[0].split('.');
          const displayName = nameParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
          
          const mockUser: User = {
            id: '1',
            name: displayName || 'Öğrenci Kullanıcı',
            email: email,
            role: 'student',
            processStarted: false,
            advisorId: 'adv-1'
          };
      
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setIsLoading(false);
          return true;
        }
        
        const data = await response.json();
        const student = data.student;
        
        // API'den gelen öğrenci bilgilerini kullan
        if (student) {
          const studentUser: User = {
            id: student.lead_id || student.id || '1',
            name: student.name,
            email: student.email,
            role: 'student',
            processStarted: student.processStarted || false,
            advisorId: student.advisorId || 'adv-1'
          };
          
          setUser(studentUser);
          localStorage.setItem('user', JSON.stringify(studentUser));
        } else {
          // API'den veri gelmezse, mock veri oluştur
          const nameParts = email.split('@')[0].split('.');
          const displayName = nameParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
          
          const mockUser: User = {
            id: '1',
            name: displayName || 'Öğrenci Kullanıcı',
            email: email,
            role: 'student',
            processStarted: false,
            advisorId: 'adv-1'
          };
      
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
        }
        
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      
      // Hata durumunda basit bir kullanıcı bilgisi oluşturalım
      const nameParts = email.split('@')[0].split('.');
      const displayName = nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
      
      if (role === 'advisor') {
        const mockAdvisor: User = {
          id: 'adv-1',
          name: displayName || 'Danışman Kullanıcı',
          email: email,
          role: 'advisor',
          studentIds: ['akifgiraypusat@gmail.com', 'burcu.shut@gmail.com']
        };
        
        setUser(mockAdvisor);
        localStorage.setItem('user', JSON.stringify(mockAdvisor));
      } else if (role === 'admin') {
        const mockAdmin: User = {
          id: 'admin-1',
          name: displayName || 'Admin Kullanıcı',
          email: email,
          role: 'admin'
        };
        
        setUser(mockAdmin);
        localStorage.setItem('user', JSON.stringify(mockAdmin));
      } else {
        const mockUser: User = {
          id: '1',
          name: displayName || 'Öğrenci Kullanıcı',
          email: email,
          role: 'student',
          processStarted: false,
          advisorId: 'adv-1'
        };
    
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      setIsLoading(false);
      return true; // Hata durumunda bile kullanıcı girişi başarılı kabul edelim
    }
  };

  // Çıkış işlemi
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail'); // Email'i de temizle
  };

  // Süreci sıfırlama işlemi
  const resetProcess = () => {
    if (user && user.role === 'student') {
      const updatedUser = { ...user, processStarted: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // API'ye süreç sıfırlama bildirimi gönder
      try {
        fetch('/api/student/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({ processStarted: false })
        }).catch(err => console.error('Süreç sıfırlama API hatası:', err));
      } catch (error) {
        console.error('Süreç sıfırlama hatası:', error);
      }
    }
  };
  
  // Süreci başlatma işlemi
  const startProcess = () => {
    if (user && user.role === 'student') {
      const updatedUser = { ...user, processStarted: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // API'ye süreç başlatma bildirimi gönder
      try {
        fetch('/api/student/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({ processStarted: true })
        }).catch(err => console.error('Süreç başlatma API hatası:', err));
      } catch (error) {
        console.error('Süreç başlatma hatası:', error);
      }
    }
  };
  
  // Kullanıcının danışman olup olmadığını kontrol et
  const isAdvisor = () => {
    return user?.role === 'advisor';
  };
  
  // Kullanıcının admin olup olmadığını kontrol et
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    startProcess,
    resetProcess,
    isAdvisor,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 