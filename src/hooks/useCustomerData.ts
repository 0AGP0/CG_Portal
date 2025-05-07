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
 * Müşteri verilerini çekmek ve gerçek zamanlı güncellemek için SWR hook'u
 * 
 * @param email - Müşteri e-posta adresi
 * @param refreshInterval - Yenileme aralığı (ms cinsinden, varsayılan: 10 saniye)
 * @returns SWR response nesnesi
 */
export function useCustomerData(email: string, refreshInterval: number = 10000) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    email ? `/api/customer?email=${encodeURIComponent(email)}` : null,
    fetcher,
    {
      refreshInterval, // Belirtilen aralıkla otomatik yenileme
      revalidateOnFocus: true, // Sayfa odaklandığında yenile
      revalidateIfStale: true, // Veri bayatsa yenile
      dedupingInterval: 2000, // 2 saniye içinde tekrar eden istekleri birleştir
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