import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

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

    // messages.json dosyasının yolunu belirle
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    
    // Dosya varlığını kontrol et ve yoksa oluştur
    if (!fs.existsSync(filePath)) {
      logger.info('Mesaj veritabanı bulunamadı, yeni dosya oluşturuluyor');
      const initialData: ConversationData = { conversations: [] };
      await fsPromises.writeFile(filePath, JSON.stringify(initialData, null, 2));
    }

    // Dosyayı oku
    let data: ConversationData;
    try {
      const fileContent = await fsPromises.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      logger.error('Mesaj veritabanı okuma hatası:', error);
      return NextResponse.json(
        { success: false, error: 'Mesaj veritabanı okunamadı' },
        { status: 500 }
      );
    }

    // Öğrencinin konuşmalarını filtrele
    const conversations = data.conversations || [];
    const studentConversations = conversations.filter(conv => 
      conv.studentEmail.toLowerCase() === email.toLowerCase()
    );

    // Konuşmaları ticket formatına dönüştür
    const tickets: Ticket[] = studentConversations.map(conv => {
      const lastMessage = conv.messages[conv.messages.length - 1];
      const unreadCount = conv.messages.filter(msg => !msg.isRead && msg.senderEmail !== email).length;
      
      return {
        id: parseInt(conv.id.split('-')[1]) || Date.now(),
        subject: conv.subject,
        preview: lastMessage ? lastMessage.content.substring(0, 100) : '',
        date: conv.lastMessageAt,
        isRead: unreadCount === 0,
        studentEmail: conv.advisorEmail,
        studentName: conv.advisorEmail.split('@')[0],
        messages: conv.messages.map(msg => ({
          sender: msg.senderEmail === email ? 'user' : 'advisor',
          content: msg.content,
          timestamp: msg.timestamp
        }))
      };
    });

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