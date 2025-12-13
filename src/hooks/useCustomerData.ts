import useSWR from 'swr';

// SWR fetcher fonksiyonu
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
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
 * Müşteri verilerini çekmek için SWR hook'u
 * Polling kapalı - sadece manuel refresh ile güncellenir
 * 
 * @param email - Müşteri e-posta adresi
 * @returns SWR response nesnesi
 */
export function useCustomerData(email: string) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    email ? `/api/customer?email=${encodeURIComponent(email)}` : null,
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
    customer: data,
    isLoading,
    isError: error,
    isValidating,
    mutate, // Veriyi manuel yenileme için kullanılabilir
  };
} 