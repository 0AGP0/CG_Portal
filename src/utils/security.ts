import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// NextRequest tipini genişlet
declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
    ip?: string;
  }
}

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

// JWT ve şifreleme için environment değişkenleri
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Rate limiting için basit bir in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export const rateLimiter = (req: NextRequest) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

  const current = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }

  rateLimitStore.set(ip, current);

  if (current.count > maxRequests) {
    return NextResponse.json(
      { error: 'Çok fazla istek gönderildi' },
      { status: 429 }
    );
  }

  return null;
};

// JWT için tip tanımlamaları
type JWTPayload = {
  id: string;
  email: string;
  role: string;
};

// JWT token oluşturma
export const generateToken = (payload: JWTPayload): string => {
  // @ts-ignore - jsonwebtoken tip tanımlamaları ile ilgili sorun
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT token doğrulama
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    // @ts-ignore - jsonwebtoken tip tanımlamaları ile ilgili sorun
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JWTPayload;
  } catch (error) {
    secureLog('Token doğrulama hatası:', error);
    return null;
  }
};

// Şifre hashleme
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Şifre doğrulama
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // XSS koruması
    .trim();
};

// CSRF token oluşturma
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Güvenli oturum yönetimi için middleware
export async function authMiddleware(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme token\'ı bulunamadı' },
        { status: 401 }
      );
    }

    // Token doğrulama
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Rate limiting kontrolü
    const rateLimitResult = rateLimiter(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // CSRF token kontrolü
    if (process.env.ENABLE_CSRF === 'true') {
      const csrfToken = request.headers.get('x-csrf-token');
      if (!csrfToken) {
        return NextResponse.json(
          { error: 'CSRF token bulunamadı' },
          { status: 403 }
        );
      }
    }

    // Kullanıcı bilgilerini request'e ekle
    request.user = decoded;

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    return NextResponse.json(
      { error: 'Yetkilendirme hatası' },
      { status: 401 }
    );
  }
}

// Rol tabanlı erişim kontrolü (RBAC)
export function checkRole(allowedRoles: string[]) {
  return (request: NextRequest) => {
    const user = request.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmuyor' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  };
}

// Güvenli veri şifreleme
export function encryptData(data: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || '', 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // IV ve auth tag'i encrypted data ile birleştir
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Şifrelenmiş veriyi çözme
export function decryptData(encryptedData: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || '', 'salt', 32);
  
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Güvenli dosya yükleme kontrolü
export function validateFileUpload(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Geçersiz dosya türü');
  }

  if (file.size > maxSize) {
    throw new Error('Dosya boyutu çok büyük');
  }

  return true;
}

// Güvenli loglama
export const secureLog = (message: string, data?: any) => {
  const sanitizedData = data ? JSON.stringify(data, (key, value) => {
    // Hassas verileri maskeleme
    if (key === 'password' || key === 'token' || key === 'secret') {
      return '***';
    }
    return value;
  }) : undefined;

  console.log(`[${new Date().toISOString()}] ${message}`, sanitizedData);
}; 