import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

interface MessageData {
  messages: Array<{
    id: string;
    senderEmail: string;
    receiverEmail: string;
    senderRole: string;
    content: string;
    subject: string;
    category: string;
    replyToId?: string;
    createdAt: string;
    isRead: boolean;
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

    // messages.json dosyasının yolunu belirle
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    
    // Dosya varlığını kontrol et ve yoksa oluştur
    if (!fs.existsSync(filePath)) {
      logger.info('Mesaj veritabanı bulunamadı, yeni dosya oluşturuluyor');
      const initialData: MessageData = { messages: [] };
      await fsPromises.writeFile(filePath, JSON.stringify(initialData, null, 2));
    }

    // Dosyayı oku
    let data: MessageData;
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

    // Danışmanın mesajlarını filtrele ve ticket formatına dönüştür
    const messages = data.messages || [];
    const advisorMessages = messages
      .filter((message) => 
        message.senderEmail.toLowerCase() === userEmail.toLowerCase() || 
        message.receiverEmail.toLowerCase() === userEmail.toLowerCase()
      )
      .map((message) => ({
        id: parseInt(message.id.split('-')[1]),
        subject: message.subject,
        preview: message.content.substring(0, 100),
        date: message.createdAt,
        isRead: message.isRead,
        studentEmail: message.senderEmail === userEmail ? message.receiverEmail : message.senderEmail,
        studentName: message.senderEmail === userEmail ? 'Öğrenci' : 'Danışman',
        messages: [{
          sender: message.senderEmail === userEmail ? 'advisor' : 'user',
          content: message.content,
          timestamp: message.createdAt
        }]
      }));

    // Mesajları tarihe göre sırala
    const sortedMessages = advisorMessages.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    logger.info('Danışman mesajları başarıyla getirildi', { 
      messageCount: sortedMessages.length 
    });

    return NextResponse.json({
      success: true,
      tickets: sortedMessages
    });
    
  } catch (error) {
    logger.error('Danışman mesajları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 