"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/utils/logger';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'advisor' | 'admin';
  [key: string]: any;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string, role?: 'student' | 'advisor' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  isAdvisor: () => boolean;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Oturum durumunu başlat
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user='))
          ?.split('=')[1];

        if (userCookie) {
          try {
            const decodedCookie = decodeURIComponent(userCookie);
            const userData = JSON.parse(decodedCookie);
            logger.info('Cookie\'den kullanıcı bilgileri yüklendi:', userData);
            
            if (userData && userData.email && userData.role && userData.id) {
              // Kullanıcı bilgilerini doğrula
              const response = await fetch(`/api/auth/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userData.email, role: userData.role }),
                credentials: 'include'
              });

              if (response.ok) {
                setUser(userData);
                setIsAuthenticated(true);
                logger.info('Kullanıcı oturumu doğrulandı:', userData.email);
              } else {
                logger.error('Oturum doğrulama hatası:', await response.text());
                throw new Error('Oturum doğrulanamadı');
              }
            } else {
              logger.error('Geçersiz kullanıcı bilgileri:', userData);
              throw new Error('Geçersiz kullanıcı bilgileri');
            }
          } catch (parseError) {
            logger.error('Cookie parse hatası:', parseError);
            // Hatalı cookie'yi temizle
            document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            throw new Error('Kullanıcı bilgileri okunamadı');
          }
        } else {
          logger.info('Kullanıcı cookie\'si bulunamadı');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        logger.error('Oturum başlatma hatası:', error);
        // Hatalı cookie'yi temizle
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password?: string, role?: 'student' | 'advisor' | 'admin'): Promise<boolean> => {
    try {
      setError(null);
      const userRole = role || 'student';
      const endpoint = `/api/auth/${userRole}`;
      
      logger.info('Giriş isteği gönderiliyor:', { endpoint, email, role: userRole });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Sunucu hatası' }));
        throw new Error(errorData.error || 'Giriş başarısız');
      }

      const data = await response.json();
      
      if (!data.success || !data.user) {
        throw new Error(data.error || 'Geçersiz yanıt formatı');
      }

      // Kullanıcı bilgilerini güncelle
      const userData = {
        ...data.user,
        role: data.user.role || userRole
      };

      // Token ve kullanıcı bilgilerini cookie'ye kaydet
      document.cookie = `token=${data.token || 'dummy-token'}; path=/; max-age=86400; SameSite=Lax; Secure`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax; Secure`;

      // State'i güncelle
      setUser(userData);
      setIsAuthenticated(true);
      
      logger.info('Giriş başarılı:', userData);
      return true;
    } catch (error) {
      logger.error('Giriş hatası:', error);
      setError(error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Cookie'leri temizle
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // State'i sıfırla
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Login sayfasına yönlendir
      window.location.href = '/login';
    } catch (error) {
      logger.error('Çıkış hatası:', error);
      setError('Çıkış yapılırken bir hata oluştu');
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
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    isAdvisor,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 