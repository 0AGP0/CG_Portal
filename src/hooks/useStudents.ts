import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/context/AuthContext';

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
 * Danışmanın öğrencilerini çekmek için SWR hook'u
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @returns SWR response nesnesi
 */
export function useStudents() {
  const { user, isAdvisor } = useAuth();
  
  // Danışman değilse veya giriş yapılmamışsa boş dizi dön
  const shouldFetch = user && isAdvisor();
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `/api/advisor/students` : null,
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
  const { user, isAdvisor } = useAuth();
  
  // Danışman değilse veya giriş yapılmamışsa null dön
  const shouldFetch = user && isAdvisor() && studentEmail;
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? `/api/advisor/students/${encodeURIComponent(studentEmail)}` : null,
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