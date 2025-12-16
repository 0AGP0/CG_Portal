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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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





