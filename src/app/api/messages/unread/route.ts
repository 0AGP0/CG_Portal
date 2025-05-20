import { NextRequest, NextResponse } from 'next/server';
import { getUnreadMessagesCount } from '@/utils/database';
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
    
    // Okunmamış mesaj sayısını getir
    const unreadCount = await getUnreadMessagesCount(email);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      unreadCount
    });
    
  } catch (error) {
    logError('Okunmamış mesaj sayısı hatası', error);
    return NextResponse.json(
      { error: 'Okunmamış mesajlar sayılırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 