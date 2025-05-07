import fs from 'fs';
import path from 'path';

// Log dosyası yolu
const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const INFO_LOG = path.join(LOG_DIR, 'info.log');

// Log klasörünü oluştur
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Log mesajı oluştur
 * 
 * @param level - Log seviyesi (error, info, warn)
 * @param message - Log mesajı
 * @param meta - Ek veri
 * @returns string - Formatlanmış log mesajı
 */
function formatLogMessage(level: string, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (meta) {
    try {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    } catch (e) {
      logMessage += `\n[Meta içeriği serilize edilemedi]`;
    }
  }
  
  return logMessage + '\n';
}

/**
 * Hata logu
 * 
 * @param message - Hata mesajı
 * @param error - Hata nesnesi veya ek bilgi
 */
export function logError(message: string, error?: any): void {
  ensureLogDir();
  
  const errorMessage = formatLogMessage('error', message, error);
  
  // Konsola yazdır
  console.error(errorMessage);
  
  // Dosyaya yaz
  try {
    fs.appendFileSync(ERROR_LOG, errorMessage);
  } catch (e) {
    console.error('Hata logu yazılamadı:', e);
  }
  
  // Burada opsiyonel olarak e-posta bildirimi gönderilebilir
  // sendErrorEmail(message, error);
}

/**
 * Bilgi logu
 * 
 * @param message - Bilgi mesajı
 * @param data - Ek veri
 */
export function logInfo(message: string, data?: any): void {
  ensureLogDir();
  
  const infoMessage = formatLogMessage('info', message, data);
  
  // Sadece geliştirme ortamında konsola yazdır
  if (process.env.NODE_ENV !== 'production') {
    console.log(infoMessage);
  }
  
  // Dosyaya yaz
  try {
    fs.appendFileSync(INFO_LOG, infoMessage);
  } catch (e) {
    console.error('Bilgi logu yazılamadı:', e);
  }
}

/**
 * Webhook isteği logu
 * 
 * @param source - Webhook kaynağı
 * @param status - İşlem durumu
 * @param data - İstek verisi
 */
export function logWebhook(source: string, status: 'success' | 'error', data?: any): void {
  const message = `Webhook alındı: ${source} - Durum: ${status}`;
  
  if (status === 'error') {
    logError(message, data);
  } else {
    logInfo(message, data);
  }
} 