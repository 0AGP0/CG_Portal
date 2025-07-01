import { NextRequest, NextResponse } from 'next/server';
import { getConversationsByUser, getMessagesBetweenUsers } from '@/lib/db';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    const otherUser = request.nextUrl.searchParams.get('otherUser');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    let messages;
    
    if (otherUser) {
      // Belirli bir kullanıcı ile olan mesajları getir
      messages = await getMessagesBetweenUsers(email, otherUser);
    } else {
      // Kullanıcının tüm konuşmalarını getir (varsayılan olarak student rolü)
      messages = await getConversationsByUser(email, 'student');
    }
    
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