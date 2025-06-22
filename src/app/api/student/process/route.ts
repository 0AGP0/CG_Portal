import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail, updateOrCreateRecord } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = request.headers.get('x-user-email');
    
    // E-posta kontrolü
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Öğrenciyi e-posta adresine göre bul
    const student = await getRecordByEmail(email);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Süreç durumunu güncelle
    const processStarted = typeof body.processStarted === 'boolean' ? body.processStarted : true;
    
    // Öğrenci kaydını güncelle
    await updateOrCreateRecord({
      email: email,
      processStarted: processStarted
    });
    
    // Başarılı güncelleme
    return NextResponse.json({
      success: true,
      message: processStarted ? 'Süreç başlatıldı' : 'Süreç sıfırlandı',
      processStarted: processStarted
    });
    
  } catch (error) {
    logError('Süreç güncelleme hatası', error);
    return NextResponse.json(
      { error: 'Süreç güncellenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 