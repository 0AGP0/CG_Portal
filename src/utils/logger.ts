// Basit bir logger implementasyonu
const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

/**
 * Hata logu
 * 
 * @param message - Hata mesajı
 * @param error - Hata nesnesi veya ek bilgi
 */
export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

/**
 * Bilgi logu
 * 
 * @param message - Bilgi mesajı
 * @param data - Ek veri
 */
export const logInfo = (message: string, data?: any) => {
  logger.info(message, data);
};

/**
 * Webhook isteği logu
 * 
 * @param source - Webhook kaynağı
 * @param status - İşlem durumu
 * @param data - İstek verisi
 */
export const logWebhook = (source: string, status: 'success' | 'error', data?: any) => {
  const message = `Webhook alındı: ${source} - Durum: ${status}`;
  if (status === 'error') {
    logger.error(message, data);
  } else {
    logger.info(message, data);
  }
};

export { logger }; 