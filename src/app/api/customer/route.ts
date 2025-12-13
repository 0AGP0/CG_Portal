import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Authentication kontrolü - header'dan email al
    const userEmail = request.headers.get('x-user-email');
    
    // Eğer header yoksa, query'den email al ama sadece internal kullanım için
    const searchParams = request.nextUrl.searchParams;
    const email = userEmail || searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email parametresi gerekli veya x-user-email header\'ı gönderilmelidir' 
      }, { status: 400 });
    }
    
    // Email'e göre müşteri kaydını getir
    const customerData = await getRecordByEmail(email);
    
    if (!customerData) {
      return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
    }
    
    return NextResponse.json(customerData);
  } catch (error) {
    logError('Müşteri verisi getirme hatası', error);
    return NextResponse.json({ error: 'Veri alma hatası' }, { status: 500 });
  }
} 