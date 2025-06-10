"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getRecordByEmail } from '@/utils/database';

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
  isLoading: boolean;
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
  isLoading: true,
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
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mesajları getir
  const fetchMessages = async () => {
    try {
      if (!user || !isAuthenticated) {
        console.log('Kullanıcı giriş yapmamış veya oturum geçersiz');
        setTickets([]);
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);
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
          'x-user-email': user.email
        }
      });
      
      console.log('Mesaj API yanıtı:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mesaj API hata detayı:', errorData);
        
        if (response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
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
    if (user && isAuthenticated) {
      setIsLoading(true);
      fetchMessages();
    } else {
      setTickets([]);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

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
      setIsLoading(true);
      
      // Alıcı e-posta adresini belirle
      let receiverEmail = '';
      
      if (user.role === 'student') {
        // Öğrenci ise, danışmanı bul
        const student = await getRecordByEmail(user.email);
        if (!student || !student.advisorEmail) {
          throw new Error('Danışman bilgisi bulunamadı');
        }
        receiverEmail = student.advisorEmail;
      } else if (user.role === 'advisor') {
        // Danışman ise, öğrenciye mesaj gönder
        receiverEmail = ticket.studentEmail || ticket.studentId || '';
        
        if (!receiverEmail) {
          throw new Error('Öğrenci e-posta adresi bulunamadı');
        }
      }
      
      // API isteği 
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          receiverEmail,
          content,
          senderRole: user.role,
          subject: ticket.subject,
          replyToId: ticket.id.toString(),
          category: 'general'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Mesaj gönderilemedi');
      }

      // Mesajlar başarıyla gönderildi, listeyi yenile
      await fetchMessages();
      
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setError(error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      
      if (user.role === 'student') {
        // Öğrenci ise, danışmanı bul
        const student = await getRecordByEmail(user.email);
        if (!student || !student.advisorEmail) {
          throw new Error('Danışman bilgisi bulunamadı');
        }
        
        // Alıcıya mesaj gönder
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({
            receiverEmail: student.advisorEmail,
            content,
            senderRole: user.role,
            subject,
            category: 'general'
          })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Yeni konu oluşturulamadı');
        }

        // Mesajlar başarıyla gönderildi, listeyi yenile
        await fetchMessages();
        
      } else {
        throw new Error('Sadece öğrenciler yeni konu oluşturabilir');
      }
    } catch (error) {
      console.error('Yeni konu oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Yeni konu oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
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
      isLoading,
      error
    }}>
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesContext; 