import { NextRequest, NextResponse } from 'next/server';
import { getConversationsByUser, getMessagesBetweenUsers } from '@/lib/db';
import { logger } from '@/utils/logger';

interface Ticket {
  id: number;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  studentEmail: string;
  studentName: string;
  messages: Array<{
    sender: 'user' | 'advisor';
    content: string;
    timestamp: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    logger.info('Danışman mesajları isteği alındı');
    
    // Kullanıcı e-postasını header'dan al
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      logger.error('Kullanıcı e-postası bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    
    logger.info('Danışman mesajları getiriliyor', { userEmail });

    // Veritabanından danışmanın konuşmalarını getir
    const conversations = await getConversationsByUser(userEmail, 'advisor');
    
    // Her konuşma için mesajları getir ve ticket formatına dönüştür
    const tickets: Ticket[] = [];
    
    for (const conv of conversations) {
      const messages = await getMessagesBetweenUsers(conv.student_email, userEmail);
      const lastMessage = messages[messages.length - 1];
      const unreadCount = messages.filter(msg => !msg.is_read && msg.sender_email !== userEmail).length;
      
      tickets.push({
        id: conv.id,
        subject: conv.subject || 'Genel Konuşma',
        preview: lastMessage ? lastMessage.content.substring(0, 100) : '',
        date: lastMessage ? lastMessage.created_at : conv.created_at,
        isRead: unreadCount === 0,
        studentEmail: conv.student_email,
        studentName: conv.student_email.split('@')[0],
        messages: messages.map(msg => ({
          sender: msg.sender_email === userEmail ? 'advisor' : 'user',
          content: msg.content,
          timestamp: msg.created_at
        }))
      });
    }

    // Ticket'ları tarihe göre sırala
    const sortedTickets = tickets.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    logger.info('Danışman mesajları başarıyla getirildi', { 
      messageCount: sortedTickets.length 
    });

    return NextResponse.json({
      success: true,
      tickets: sortedTickets
    });
    
  } catch (error) {
    logger.error('Danışman mesajları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 