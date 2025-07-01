import { NextRequest, NextResponse } from 'next/server';
import { getConversationsByUser, getMessagesBetweenUsers } from '@/lib/db';
import { logger } from '@/utils/logger';

interface Ticket {
  id: number;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  advisorEmail: string;
  advisorName: string;
  messages: Array<{
    sender: 'user' | 'advisor';
    content: string;
    timestamp: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    logger.info('Öğrenci mesajları isteği alındı');
    
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      logger.error('Kullanıcı email bilgisi bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgisi bulunamadı' },
        { status: 401 }
      );
    }

    // Veritabanından öğrencinin konuşmalarını getir
    const conversations = await getConversationsByUser(email, 'student');
    
    // Her konuşma için mesajları getir ve ticket formatına dönüştür
    const tickets: Ticket[] = [];
    
    for (const conv of conversations) {
      const messages = await getMessagesBetweenUsers(email, conv.advisor_email);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(msg => !msg.is_read && msg.sender_email !== email).length;
      
      tickets.push({
        id: conv.id,
        subject: conv.subject || 'Genel Konuşma',
        preview: lastMessage ? lastMessage.content.substring(0, 100) : '',
        date: lastMessage ? lastMessage.created_at : conv.created_at,
        isRead: unreadCount === 0,
        advisorEmail: conv.advisor_email,
        advisorName: conv.advisor_email.split('@')[0],
        messages: messages.map(msg => ({
          sender: msg.sender_email === email ? 'user' : 'advisor',
          content: msg.content,
          timestamp: msg.created_at
        }))
      });
    }

    // Ticket'ları tarihe göre sırala
    const sortedTickets = tickets.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    logger.info('Öğrenci mesajları başarıyla getirildi', { 
      messageCount: sortedTickets.length 
    });

    return NextResponse.json({
      success: true,
      tickets: sortedTickets
    });
    
  } catch (error) {
    logger.error('Öğrenci mesajları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 