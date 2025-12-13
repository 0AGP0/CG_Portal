// API Route temel dosyası
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Rate limiting middleware tarafından korunuyor
  // Sadece minimal bilgi döndür
  return NextResponse.json({ 
    status: 'API çalışıyor',
    timestamp: new Date().toISOString()
  });
} 