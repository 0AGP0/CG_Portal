import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useMessages as useMessagesContext } from '@/context/MessagesContext';

// SWR fetcher fonksiyonu
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'x-user-email': localStorage.getItem('userEmail') || '',
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    const error = new Error('Veri çekme başarısız oldu');
    const errorInfo = await res.json().catch(() => ({}));
    (error as any).info = errorInfo;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
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
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @param messageId - Mesaj ID'si
 * @returns SWR response nesnesi
 */
export function useMessageDetail(messageId: string | null) {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa veya mesaj ID'si yoksa null dön
  const shouldFetch = user !== null && messageId !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `/api/messages/${messageId}` : null,
    fetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @returns SWR response nesnesi
 */
export function useUnreadMessagesCount() {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa null dön
  const shouldFetch = user !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? '/api/messages/unread' : null,
    fetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @returns SWR response nesnesi
 */
export function useStudents() {
  const { user, isAdvisor, isSales } = useAuth();
  
  // Danışman veya satış ekibi değilse veya giriş yapılmamışsa boş dizi dön
  const shouldFetch = user && (isAdvisor() || isSales());
  
  // Kullanıcı rolüne göre endpoint seçimi
  const endpoint = isAdvisor() ? `/api/advisor/students` : `/api/sales/students`;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? endpoint : null,
    fetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @param studentEmail - Öğrenci e-posta adresi
 * @returns SWR response nesnesi
 */
export function useStudentDetail(studentEmail: string) {
  const { user, isAdvisor, isSales } = useAuth();
  
  // Danışman veya satış ekibi değilse veya giriş yapılmamışsa null dön
  const shouldFetch = user && (isAdvisor() || isSales()) && studentEmail;
  
  // Kullanıcı rolüne göre endpoint seçimi
  const baseEndpoint = isAdvisor() ? `/api/advisor/students/` : `/api/sales/students/`;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `${baseEndpoint}${encodeURIComponent(studentEmail)}` : null,
    fetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @returns SWR response nesnesi
 */
export function useDocuments() {
  const { user } = useAuth();
  
  // Giriş yapılmamışsa boş dizi dön
  const shouldFetch = user !== null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? '/api/documents' : null,
    fetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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

/**
 * Öğrenci profil verilerini çekmek için SWR hook'u
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @returns SWR response nesnesi
 */
export function useStudentProfile() {
  const { user } = useAuth();
  
  // Öğrenci değilse veya giriş yapılmamışsa null dön
  const shouldFetch = user !== null && user.role === 'student';
  
  // Özel fetcher - header ile email gönder
  const profileFetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'x-user-email': user?.email || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = new Error('Profil verisi çekme başarısız oldu');
      const errorInfo = await res.json().catch(() => ({}));
      (error as any).info = errorInfo;
      (error as any).status = res.status;
      throw error;
    }
    
    const data = await res.json();
    return data.student || null;
  };
  
  // SWR key'ine user email'ini ekle - kullanıcı değiştiğinde otomatik yeniden fetch edilir
  const swrKey = shouldFetch ? `/api/student/profile?email=${user?.email || ''}` : null;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    profileFetcher,
    {
      refreshInterval: 0, // Polling tamamen kapalı
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 saniye içinde tekrar eden istekleri birleştir
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