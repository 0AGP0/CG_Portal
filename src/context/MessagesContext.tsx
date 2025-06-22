"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getRecordByEmail } from '@/utils/database';
import { getCookie, removeCookie } from '@/utils/cookies';

// Mesaj türleri
export interface Message {
  sender: 'user' | 'advisor';
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: number;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  studentId?: string;
  studentEmail?: string;
  studentName?: string;
  messages: Message[];
}

interface MessagesContextType {
  tickets: Ticket[];
  unreadCount: number;
  selectedTicketId: number | null;
  selectTicket: (id: number) => void;
  sendMessage: (ticket: Ticket, content: string) => void;
  createNewTicket: (subject: string, content: string) => void;
  markAsRead: (id: number) => void;
  refreshMessages: () => void;
  setTickets: (tickets: Ticket[] | ((prev: Ticket[]) => Ticket[])) => void;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

// Başlangıç değerleri
const defaultContext: MessagesContextType = {
  tickets: [],
  unreadCount: 0,
  selectedTicketId: null,
  selectTicket: () => {},
  sendMessage: () => {},
  createNewTicket: () => {},
  markAsRead: () => {},
  refreshMessages: () => {},
  setTickets: () => {},
  isLoading: true,
  isSending: false,
  error: null
};

// Context'i oluştur
const MessagesContext = createContext<MessagesContextType>(defaultContext);

// Custom hook
export const useMessages = () => useContext(MessagesContext);

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesProvider = ({ children }: MessagesProviderProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mesajları getir
  const fetchMessages = async () => {
    try {
      if (!user || authLoading) {
        console.log('Kullanıcı giriş yapmamış veya oturum yükleniyor');
        setTickets([]);
        setIsLoading(false);
        return;
      }

      // Admin için mesaj API'sini devre dışı bırak
      if (user.role === 'admin') {
        console.log('Admin için mesaj sistemi devre dışı');
        setTickets([]);
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);
      
      // Token'ı al
      const token = getCookie('token');
      if (!token) {
        console.error('Token bulunamadı');
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setTickets([]);
        setIsLoading(false);
        return;
      }

      console.log('Mesajlar getiriliyor, kullanıcı:', user);
      
      // API endpoint'ini belirle
      const endpoint = user.role === 'advisor' 
        ? '/api/advisor/messages'
        : '/api/student/messages';
      
      console.log('Mesaj API endpoint:', endpoint);
      
      // API isteği gönder
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email,
          'x-user-role': user.role
        },
        credentials: 'include'
      });
      
      console.log('Mesaj API yanıtı:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mesaj API hata detayı:', errorData);
        
        if (response.status === 401) {
          // Token geçersiz veya süresi dolmuş
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          // Token'ı temizle ve login sayfasına yönlendir
          removeCookie('token');
          removeCookie('user');
          window.location.href = '/login';
        } else if (response.status === 404) {
          setError('Mesaj verileri bulunamadı.');
        } else if (response.status === 500) {
          setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        } else {
          setError(errorData.error || 'Mesaj verileri alınamadı');
        }
        
        setTickets([]);
        throw new Error(errorData.error || 'Mesaj verileri alınamadı');
      }
      
      const data = await response.json();
      console.log('Alınan mesaj verileri:', data);
      
      if (!data.success) {
        setError(data.error || 'Mesaj verileri alınamadı');
        setTickets([]);
        return;
      }
      
      if (data.tickets) {
        // Mesajları tarih sırasına göre sırala (en yeniden en eskiye)
        const sortedTickets = data.tickets.sort((a: Ticket, b: Ticket) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTickets(sortedTickets);
      } else {
        console.warn('Mesaj verisi boş veya beklenmeyen format:', data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Mesaj verileri alınamadı:', error);
      setError(error instanceof Error ? error.message : 'Mesajlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı değiştiğinde mesajları yükle
  useEffect(() => {
    if (user && !authLoading) {
      setIsLoading(true);
      fetchMessages();
    } else {
      setTickets([]);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Okunmamış mesaj sayısını hesapla
  useEffect(() => {
    const count = tickets.filter(ticket => !ticket.isRead).length;
    setUnreadCount(count);
  }, [tickets]);

  // Mesaj seçme
  const selectTicket = (id: number) => {
    setSelectedTicketId(id);
    
    // Mesajı okundu olarak işaretle
    markAsRead(id);
  };

  // Okundu olarak işaretle
  const markAsRead = (id: number) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === id ? { ...ticket, isRead: true } : ticket
      )
    );
  };

  // Seçili mesajı getir
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  // Mesaj gönderme
  const sendMessage = async (ticket: Ticket, content: string) => {
    if (!user) {
      setError('Mesaj göndermek için giriş yapmalısınız.');
      return;
    }

    try {
      setError(null);
      setIsSending(true);

      // Token'ı al
      const token = getCookie('token');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
        return;
      }
      
      // Alıcı e-posta adresini belirle
      let receiverEmail = '';
      
      if (user.role === 'student') {
        // Öğrenci ise, danışmanı bul
        const profileResponse = await fetch('/api/student/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-email': user.email,
            'x-user-role': user.role
          },
          credentials: 'include'
        });

        if (!profileResponse.ok) {
          throw new Error('Danışman bilgisi alınamadı');
        }

        const profileData = await profileResponse.json();
        if (!profileData.success || !profileData.student || !profileData.student.advisor_email) {
          throw new Error('Danışman bilgisi bulunamadı');
        }
        receiverEmail = profileData.student.advisor_email;
      } else if (user.role === 'advisor') {
        receiverEmail = ticket.studentEmail || ticket.studentId || '';
        
        if (!receiverEmail) {
          throw new Error('Öğrenci e-posta adresi bulunamadı');
        }
      }
      
      // API isteği 
      const messageResponse = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-email': user.email,
          'x-user-role': user.role
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverEmail,
          content,
          senderRole: user.role,
          subject: ticket.subject
        })
      });
      
      const messageData = await messageResponse.json();
      
      if (!messageResponse.ok || !messageData.success) {
        throw new Error(messageData.error || 'Mesaj gönderilemedi');
      }

      // Yeni mesajı doğrudan state'e ekle
      const newMessage = {
        sender: 'user' as const,
        content,
        timestamp: new Date().toISOString()
      };

      setTickets(prevTickets => 
        prevTickets.map(t => {
          if (t.id === ticket.id) {
            return {
              ...t,
              messages: [...t.messages, newMessage],
              preview: content,
              date: new Date().toISOString()
            };
          }
          return t;
        })
      );

    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setError(error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu');
    } finally {
      setIsSending(false);
    }
  };

  // Yeni konu oluşturma
  const createNewTicket = async (subject: string, content: string) => {
    if (!user) {
      setError('Yeni konu oluşturmak için giriş yapmalısınız.');
      return;
    }
    
    try {
      setError(null);
      setIsSending(true);
      
      if (user.role === 'student') {
        // Öğrenci ise, danışmanı bul
        const profileResponse = await fetch('/api/student/profile', {
          headers: {
            'x-user-email': user.email,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Danışman bilgisi alınamadı');
        }

        const profileData = await profileResponse.json();
        if (!profileData.success || !profileData.student || !profileData.student.advisor_email) {
          throw new Error('Danışman bilgisi bulunamadı');
        }
        
        // Alıcıya mesaj gönder
        const messageResponse = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email,
            'Authorization': `Bearer ${getCookie('token')}`
          },
          body: JSON.stringify({
            receiverEmail: profileData.student.advisor_email,
            content,
            senderRole: user.role,
            subject,
            category: 'general'
          })
        });
        
        const messageData = await messageResponse.json();
        
        if (!messageResponse.ok || !messageData.success) {
          throw new Error(messageData.error || 'Yeni konu oluşturulamadı');
        }

        // Yeni ticket'ı listeye ekle
        const newTicket: Ticket = {
          id: Date.now(),
          subject,
          preview: content,
          date: new Date().toISOString(),
          isRead: true,
          studentEmail: user.email,
          studentName: user.name,
          messages: [{
            sender: 'user',
            content,
            timestamp: new Date().toISOString()
          }]
        };

        setTickets(prevTickets => [newTicket, ...prevTickets]);
        setSelectedTicketId(newTicket.id);
        
      } else if (user.role === 'advisor') {
        // Danışman ise, öğrenci e-posta adresi gerekli
        throw new Error('Danışmanlar için öğrenci e-posta adresi gereklidir');
      } else {
        throw new Error('Sadece öğrenciler yeni konu oluşturabilir');
      }
    } catch (error) {
      console.error('Yeni konu oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Yeni konu oluşturulurken bir hata oluştu');
    } finally {
      setIsSending(false);
    }
  };

  // Mesajları yeniden yükle
  const refreshMessages = () => {
    if (user && !authLoading) {
      fetchMessages();
    }
  };

  return (
    <MessagesContext.Provider value={{
      tickets,
      unreadCount,
      selectedTicketId,
      selectTicket,
      sendMessage,
      createNewTicket,
      markAsRead,
      refreshMessages,
      setTickets,
      isLoading,
      isSending,
      error
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesContext; 