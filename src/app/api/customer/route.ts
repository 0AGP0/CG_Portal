import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parametresi gerekli' }, { status: 400 });
    }
    
    // Email'e göre müşteri kaydını getir
    const customerData = await getRecordByEmail(email);
    
    if (!customerData) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json(customerData);
  } catch (error) {
    console.error('Müşteri verisi getirme hatası:', error);
    return NextResponse.json({ error: 'Veri alma hatası' }, { status: 500 });
  }
} 