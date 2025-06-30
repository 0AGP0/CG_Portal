import { NextRequest, NextResponse } from 'next/server';
import { createMessage } from '@/lib/db';
import { logError, logInfo } from '@/utils/logger';

interface Message {
    id: string;
    senderEmail: string;
    senderRole: 'student' | 'advisor' | 'sales';
    content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
    subject: string;
  studentEmail: string;
  advisorEmail: string;
    createdAt: string;
  lastMessageAt: string;
  messages: Message[];
}

interface ConversationData {
  conversations: Conversation[];
}

export async function POST(request: NextRequest) {
  try {
    logInfo('Mesaj gönderme isteği alındı');
    
    // Gelen isteği ayrıştır
    const body = await request.json();
    const senderEmail = request.headers.get('x-user-email');
    
    logInfo('Mesaj istenen parametreler:', {
      sender: senderEmail,
      receiver: body.receiverEmail,
      role: body.senderRole,
      subject: body.subject,
      hasContent: !!body.content
    });
    
    // Gönderen e-posta adresi kontrolü
    if (!senderEmail) {
      logError('Kullanıcı kimliği eksik');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Gerekli alan kontrolleri
    if (!body.receiverEmail) {
      logError('Alıcı e-posta adresi eksik');
      return NextResponse.json(
        { success: false, error: 'Alıcı e-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    if (!body.content) {
      logError('Mesaj içeriği eksik');
      return NextResponse.json(
        { success: false, error: 'Mesaj içeriği gereklidir' }, 
        { status: 400 }
      );
    }
    
    if (!body.senderRole || !['student', 'advisor'].includes(body.senderRole)) {
      logError('Geçersiz gönderen rolü:', body.senderRole);
      return NextResponse.json(
        { success: false, error: 'Gönderen rolü geçerli değil' }, 
        { status: 400 }
      );
    }

    // Veritabanına mesaj kaydet
    const messageData = {
      senderEmail: senderEmail.toLowerCase(),
      receiverEmail: body.receiverEmail.toLowerCase(),
      senderRole: body.senderRole as 'student' | 'advisor',
      content: body.content,
      subject: body.subject || null,
      category: body.category || 'general',
      replyToId: body.replyToId || null
    };

    const newMessage = await createMessage(messageData);

    logInfo('Mesaj başarıyla oluşturuldu:', newMessage.id);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: {
        message: newMessage
      }
    }, { status: 201 });
    
  } catch (error) {
    logError('Mesaj gönderme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 