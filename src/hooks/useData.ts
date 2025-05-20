import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useMessages as useMessagesContext } from '@/context/MessagesContext';

// Basit fetch fonksiyonu
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'x-user-email': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : '',
    }
  });
  
  if (!response.ok) {
    throw new Error('API isteği başarısız oldu');
  }
  
  return response.json();
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
  const shouldFetch = user !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? '/api/messages/unread' : null,
    fetcher,
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000,
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
 * Danışmanın veya satış ekibinin öğrencilerini çekmek için SWR hook'u
 * 
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns SWR response nesnesi
 */
export function useStudents(refreshInterval: number = 10000) {
  const { user, isAdvisor, isSales } = useAuth();
  
  // Danışman veya satış ekibi değilse veya giriş yapılmamışsa boş dizi dön
  const shouldFetch = user && (isAdvisor() || isSales());
  
  // Kullanıcı rolüne göre endpoint seçimi
  const endpoint = isAdvisor() ? `/api/advisor/students` : `/api/sales/students`;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? endpoint : null,
    fetcher,
    {
      refreshInterval, 
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 2000,
    }
  );
  
  return {
    students: data?.students || [],
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
  const { user, isAdvisor, isSales } = useAuth();
  
  // Danışman veya satış ekibi değilse veya giriş yapılmamışsa null dön
  const shouldFetch = user && (isAdvisor() || isSales()) && studentEmail;
  
  // Kullanıcı rolüne göre endpoint seçimi
  const baseEndpoint = isAdvisor() ? `/api/advisor/students/` : `/api/sales/students/`;
  
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