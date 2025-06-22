import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useMessages as useMessagesContext } from '@/context/MessagesContext';
import { logger } from '@/utils/logger';

// SWR fetcher fonksiyonu
const fetcher = async (url: string, email?: string) => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    // Email parametresi varsa header'a ekle
    if (email) {
      headers['x-user-email'] = email;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Veri getirme hatası');
    }

    return response.json();
  } catch (error) {
    logger.error('Fetcher hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcı mesajlarını çekmek için SWR hook'u
 * Not: Bu hook artık context'teki mesajlaşma sistemini kullanıyor.
 * 
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns Mesajlar ve ilgili fonksiyonlar
 */
export function useMessages(refreshInterval: number = 10000) {
  // Context kullanarak mesajlara erişim
  const messagesContext = useMessagesContext();
  
  return {
    messages: messagesContext.tickets || [],
    unreadCount: messagesContext.unreadCount,
    selectedTicketId: messagesContext.selectedTicketId,
    selectTicket: messagesContext.selectTicket,
    sendMessage: messagesContext.sendMessage,
    createNewTicket: messagesContext.createNewTicket,
    markAsRead: messagesContext.markAsRead,
    isLoading: false,
    isError: null,
    isValidating: false,
    mutate: () => {},
  };
}

/**
 * Tek bir mesajın detaylarını çekmek için SWR hook'u
 * 
 * @param messageId - Mesaj ID'si
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns SWR response nesnesi
 */
export function useMessageDetail(messageId: string | null, refreshInterval: number = 10000) {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa veya mesaj ID'si yoksa null dön
  const shouldFetch = user !== null && messageId !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `/api/messages/${messageId}` : null,
    fetcher,
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 2000,
    }
  );
  
  return {
    message: data?.message || null,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/**
 * Okunmamış mesaj sayısını çekmek için SWR hook'u
 * 
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 30 saniye)
 * @returns SWR response nesnesi
 */
export function useUnreadMessagesCount(refreshInterval: number = 30000) {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa null dön
  const shouldFetch = Boolean(user?.email);
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? '/api/messages/unread' : null,
    (url) => fetcher(url, user?.email),
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000,
      onError: (err) => {
        logger.error('Okunmamış mesaj sayısı getirme hatası:', err);
      }
    }
  );
  
  return {
    unreadCount: data?.unreadCount || 0,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/**
 * Danışmanın öğrencilerini çekmek için SWR hook'u
 * 
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 30 saniye)
 * @returns SWR response nesnesi
 */
export function useStudents(refreshInterval: number = 30000) {
  const { user } = useAuth();
  
  // Danışman değilse veya giriş yapılmamışsa boş dizi dön
  const shouldFetch = Boolean(user?.email && user?.role === 'advisor');
  
  // Danışman endpoint'i
  const endpoint = '/api/advisor/students';
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? endpoint : null,
    (url) => fetcher(url, user?.email),
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 5000,
      onError: (err) => {
        logger.error('Öğrenci listesi getirme hatası:', err);
      }
    }
  );
  
  // API yanıtını kontrol et ve öğrenci listesini döndür
  const students = data?.success ? data.students : [];
  
  return {
    students,
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
}

/**
 * Tek bir öğrencinin verilerini çekmek için SWR hook'u
 * 
 * @param studentEmail - Öğrenci e-posta adresi
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns SWR response nesnesi
 */
export function useStudentDetail(studentEmail: string, refreshInterval: number = 10000) {
  const { user } = useAuth();
  
  // Danışman değilse veya giriş yapılmamışsa null dön
  const shouldFetch = Boolean(user?.email && user?.role === 'advisor' && studentEmail);
  
  // Danışman endpoint'i
  const baseEndpoint = `/api/advisor/students/`;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `${baseEndpoint}${encodeURIComponent(studentEmail)}` : null,
    fetcher,
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 2000,
    }
  );
  
  return {
    student: data,
    isLoading,
    isError: error,
    isValidating,
    mutate, 
  };
}

/**
 * Kullanıcının dokümanlarını çekmek için SWR hook'u
 * 
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns SWR response nesnesi
 */
export function useDocuments(refreshInterval: number = 10000) {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa boş dizi dön
  const shouldFetch = user !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? '/api/documents' : null,
    fetcher,
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 2000,
    }
  );
  
  return {
    documents: data?.documents || [],
    isLoading,
    isError: error,
    isValidating,
    mutate,
  };
} 