'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/context/DocumentContext';

export interface Notification {
  id: string;
  type: 'document_required' | 'document_approved' | 'document_rejected' | 'stage_change' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  stage?: 'PREPARATION' | 'VISA_APPLICATION';
  documentId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  dashboardNotifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  dashboardNotifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotification: () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashboardNotifications, setDashboardNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { documents, currentStage, getDocumentsByStage } = useDocuments();

  // Okunmamış bildirim sayısını hesapla
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Yeni bildirim ekle
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };

    // Header bildirimlerine ekle
    setNotifications(prev => [newNotification, ...prev]);
    
    // Genel bakış bildirimlerine ekle (eğer aynı tipte bildirim yoksa)
    setDashboardNotifications(prev => {
      const existingNotification = prev.find(
        n => n.type === notification.type && n.stage === notification.stage
      );
      if (!existingNotification) {
        return [newNotification, ...prev];
      }
      return prev;
    });
  };

  // Bildirimi okundu olarak işaretle
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Bildirimi sil (sadece header bildirimlerinden)
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Belge durumlarını kontrol et ve bildirim oluştur
  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const stageDocuments = getDocumentsByStage(currentStage);
    const pendingDocuments = stageDocuments.filter(doc => doc.status === 'PENDING');

    // Bekleyen belgeler için bildirim oluştur
    if (pendingDocuments.length > 0) {
      const existingNotification = dashboardNotifications.find(
        n => n.type === 'document_required' && n.stage === currentStage
      );

      if (!existingNotification) {
        addNotification({
          type: 'document_required',
          title: currentStage === 'PREPARATION' ? 'Hazırlık Belgeleri' : 'Vize Belgeleri',
          message: `${currentStage === 'PREPARATION' ? 'Hazırlık' : 'Vize'} aşaması için ${pendingDocuments.length} belge yüklemeniz gerekmektedir.`,
          stage: currentStage
        });
      }
    }
  }, [currentStage, documents, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        dashboardNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 