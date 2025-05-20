import { NextRequest, NextResponse } from 'next/server';
import { getUserMessages } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Kullanıcıya ait mesajları getir
    const messages = await getUserMessages(email);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      messages
    });
    
  } catch (error) {
    logError('Mesaj listeleme hatası', error);
    return NextResponse.json(
      { error: 'Mesajlar alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 