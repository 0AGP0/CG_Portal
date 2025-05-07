import crypto from 'crypto';

/**
 * Webhook imzasını doğrulama fonksiyonu
 * 
 * @param payload - İşlenecek JSON verisi (string olarak)
 * @param signature - Gelen X-Hub-Signature değeri
 * @param secret - Webhook secret key
 * @returns boolean - İmza geçerli mi?
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  // HMAC kullanarak imza oluştur
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  
  // Sabit zamanlı karşılaştırma yap (timing attack önlemi)
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature.replace('sha256=', ''), 'hex')
  );
}

/**
 * API token doğrulama fonksiyonu
 * 
 * @param token - İstek üzerinden gelen token
 * @returns boolean - Token geçerli mi?
 */
export function verifyApiToken(token: string): boolean {
  return token === process.env.API_TOKEN;
} 