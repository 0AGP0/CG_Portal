// API Route temel dosyası
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'API çalışıyor' });
} 