import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting için basit in-memory store (production'da Redis kullanılmalı)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit ayarları
const RATE_LIMIT = {
  // Public endpoint'ler için çok sıkı limit
  public: { max: 10, window: 60000 }, // 10 istek / dakika
  // API endpoint'ler için normal limit
  api: { max: 60, window: 60000 }, // 60 istek / dakika
  // Webhook'lar için daha yüksek limit (ama yine de korumalı)
  webhook: { max: 100, window: 60000 }, // 100 istek / dakika
};

function getRateLimitKey(request: NextRequest): string {
  // IP adresini al
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  return ip;
}

function checkRateLimit(key: string, type: 'public' | 'api' | 'webhook'): boolean {
  const now = Date.now();
  const limit = RATE_LIMIT[type];
  
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    // Yeni pencere başlat
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.window });
    return true;
  }
  
  if (record.count >= limit.max) {
    return false; // Limit aşıldı
  }
  
  // Sayacı artır
  record.count++;
  return true;
}

// Eski kayıtları temizle (memory leak önleme)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Her dakika temizle

// React2Shell (CVE-2025-55182) ve diğer zararlı içerikleri tespit et
function containsDangerousContent(text: string): boolean {
  const dangerousPatterns = [
    // React2Shell saldırı desenleri
    /__rsc/i,
    /react-server/i,
    /flight/i,
    /server-components/i,
    /\.rsc/i,
    // Zararlı komutlar
    /exec\s*\(/i,
    /spawn\s*\(/i,
    /child_process/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /wget\s+/i,
    /curl\s+/i,
    /\.sh/i,
    // Zararlı IP'ler
    /194\.69\.203\.32/i,
    /51\.81\.104\.115/i,
    // Zararlı dosya/dizin desenleri
    /system3d/i,
    /\.est1/i,
    /\.b4nd1d0/i,
    /\/tmp\/\.est/i,
    /\/root\/\.local/i,
    /pACEd|50oN|jdCIjbm/i,
    /nuts/i,
    /reactOnMynuts/i,
    /busybox/i,
    /hiddenbink/i,
    /bins\.sh/i,
    /colonna\./i,
    // Şüpheli path'ler
    /cd\s+\/tmp/i,
    /chmod\s+777/i,
    /bash\s+-c/i,
    /sh\s+-c/i,
    /\.\/[a-zA-Z0-9]+/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(text));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // GÜVENLİK: URL parametrelerini kontrol et
  const urlString = request.url;
  if (containsDangerousContent(urlString)) {
    return NextResponse.json(
      { error: 'Invalid request - security violation detected' },
      { status: 403 }
    );
  }
  
  // GÜVENLİK: POST/PUT/PATCH isteklerinde body'yi kontrol et
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      // Body'yi klonla (orijinal request'i bozmadan)
      const clonedRequest = request.clone();
      const body = await clonedRequest.text();
      
      if (body && containsDangerousContent(body)) {
        return NextResponse.json(
          { error: 'Invalid request - security violation detected' },
          { status: 403 }
        );
      }
    } catch (error) {
      // Body okuma hatası - güvenlik için reddet
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
  }
  
  // Public endpoint'ler - çok sıkı rate limit
  if (pathname === '/api' || pathname === '/api/customer') {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 'public')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  // Webhook endpoint'leri - orta seviye rate limit
  if (pathname.startsWith('/api/odoo-webhook') || pathname.startsWith('/api/odoo-pull')) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 'webhook')) {
      return NextResponse.json(
        { error: 'Webhook rate limit exceeded. Please contact support.' },
        { status: 429 }
      );
    }
  }
  
  // Diğer API endpoint'leri - normal rate limit
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 'api')) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};





