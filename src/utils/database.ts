import { logger } from '@/utils/logger';

// Client-side cache için basit bir veri deposu
const cache = {
  customers: new Map<string, any>(),
  advisors: new Map<string, any>(),
  messages: new Map<string, any>(),
  lastUpdated: new Map<string, number>()
};

// Cache süresi (5 dakika)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache'i temizle
const clearCache = () => {
  const now = Date.now();
  for (const [key, timestamp] of cache.lastUpdated.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      cache.customers.delete(key);
      cache.advisors.delete(key);
      cache.messages.delete(key);
      cache.lastUpdated.delete(key);
    }
  }
};

// API URL'sini oluştur
const getApiUrl = (path: string) => {
  // Server-side için
  if (typeof window === 'undefined') {
    return `http://localhost:3000${path}`;
  }
  // Client-side için
  return `${window.location.origin}${path}`;
};

// Veri tipleri
export interface CustomerRecord {
  email: string;
  lead_id?: string;
  stage?: string;
  university?: string;
  program?: string;
  documents?: DocumentRecord[];
  updatedAt: string;
  advisorEmail?: string;
  advisor?: {
    id: string;
    name: string;
    email: string;
  };
  [key: string]: any;
}

export interface DocumentRecord {
  documentType: string;
  documentUrl: string;
  documentName: string;
  updatedAt: string;
}

export interface AdvisorRecord {
  id: string;
  email: string;
  name: string;
  studentIds: string[];
  updatedAt: string;
  [key: string]: any;
}

export interface MessageRecord {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  senderRole: 'student' | 'advisor' | 'sales';
  content: string;
  createdAt: string;
  isRead: boolean;
  replyToId?: string;
  subject?: string;
  category?: string;
}

// Okunmamış mesaj sayısını getirme
export async function getUnreadMessagesCount(email: string): Promise<number> {
  try {
    // Cache'i kontrol et
    const cacheKey = `unread_${email}`;
    const cachedData = cache.messages.get(cacheKey);
    const lastUpdated = cache.lastUpdated.get(cacheKey);
    
    if (cachedData !== undefined && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
      return cachedData;
    }

    // API'den veriyi al
    const url = getApiUrl(`/api/messages/unread?email=${encodeURIComponent(email)}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Okunmamış mesaj sayısı alınamadı');
    }

    const data = await response.json();
    if (!data.success) {
      return 0;
    }

    // Cache'e kaydet
    cache.messages.set(cacheKey, data.count);
    cache.lastUpdated.set(cacheKey, Date.now());

    return data.count;
  } catch (error) {
    console.error('Okunmamış mesaj sayısı getirme hatası:', error);
    return 0;
  }
}

// E-posta adresine göre kayıt bulma
export async function getRecordByEmail(email: string): Promise<CustomerRecord | null> {
  try {
    // Cache'i kontrol et
    const cachedData = cache.customers.get(email);
    const lastUpdated = cache.lastUpdated.get(email);
    
    if (cachedData && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
      return cachedData;
    }

    // API'den veriyi al
    const url = getApiUrl(`/api/student/${encodeURIComponent(email)}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Öğrenci bilgisi alınamadı');
    }

    const data = await response.json();
    if (!data.success || !data.student) {
      return null;
    }

    // Cache'e kaydet
    cache.customers.set(email, data.student);
    cache.lastUpdated.set(email, Date.now());

    return data.student;
  } catch (error) {
    console.error('Öğrenci kaydı getirme hatası:', error);
    return null;
  }
}

// E-posta adresine göre danışman bulma
export async function getAdvisorByEmail(email: string): Promise<AdvisorRecord | null> {
  try {
    logger.info('Danışman arama başlatıldı:', email);

    // Cache kontrolü
    const cacheKey = `advisor_${email}`;
    const cachedData = cache.advisors.get(cacheKey);
    if (cachedData) {
      logger.info('Danışman bilgileri cache\'den getirildi:', email);
      return cachedData;
    }

    // API endpoint'ine istek gönder
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/advisor/${encodeURIComponent(email)}`;
    logger.info('Danışman API isteği gönderiliyor:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include' // Cookie'leri otomatik olarak gönder
    });

    if (!response.ok) {
      if (response.status === 401) {
        logger.error('Danışman oturumu geçersiz:', email);
        cache.advisors.delete(cacheKey); // Cache'i temizle
        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
      throw new Error(`Danışman bilgileri alınamadı: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      logger.error('Danışman API yanıt hatası:', data.error);
      throw new Error(data.error || 'Danışman bilgileri alınamadı');
    }

    const advisor = data.advisor;
    if (!advisor) {
      logger.error('Danışman bulunamadı:', email);
      return null;
    }

    // Cache'e kaydet
    cache.advisors.set(cacheKey, advisor);
    logger.info('Danışman bilgileri başarıyla getirildi:', email);
    
    return advisor;
  } catch (error) {
    logger.error('Danışman kaydı getirme hatası:', error);
    throw error;
  }
}

// Kullanıcıya ait mesajları getirme
export async function getUserMessages(email: string): Promise<MessageRecord[]> {
  try {
    // Cache'i kontrol et
    const cachedData = cache.messages.get(email);
    const lastUpdated = cache.lastUpdated.get(email);
    
    if (cachedData && lastUpdated && Date.now() - lastUpdated < CACHE_DURATION) {
      return cachedData;
    }

    // API'den veriyi al
    const url = getApiUrl(`/api/messages?email=${encodeURIComponent(email)}`);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Mesajlar alınamadı');
    }

    const data = await response.json();
    if (!data.success || !data.messages) {
      return [];
    }

    // Cache'e kaydet
    cache.messages.set(email, data.messages);
    cache.lastUpdated.set(email, Date.now());

    return data.messages;
  } catch (error) {
    console.error('Mesaj getirme hatası:', error);
    return [];
  }
}

// Yeni mesaj oluşturma
export async function createMessage(data: Omit<MessageRecord, 'id' | 'createdAt' | 'isRead'>): Promise<MessageRecord | null> {
  try {
    const url = getApiUrl('/api/messages/send');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Mesaj gönderilemedi');
    }

    const result = await response.json();
    if (!result.success || !result.message) {
      return null;
    }

    // Cache'i temizle
    cache.messages.delete(data.senderEmail);
    cache.messages.delete(data.receiverEmail);
    cache.lastUpdated.delete(data.senderEmail);
    cache.lastUpdated.delete(data.receiverEmail);

    return result.message;
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    return null;
  }
}

// Mesajın okundu olarak işaretlenmesi
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const url = getApiUrl(`/api/messages/${messageId}/read`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Mesaj okundu olarak işaretlenemedi');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Mesaj okundu işaretleme hatası:', error);
    return false;
  }
}

// Periyodik olarak cache'i temizle
if (typeof window !== 'undefined') {
  setInterval(clearCache, CACHE_DURATION);
} 