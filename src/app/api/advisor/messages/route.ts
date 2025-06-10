import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logError, logInfo } from '@/utils/logger';

interface MessageData {
  messages: Array<{
    id: string;
    senderEmail: string;
    receiverEmail: string;
    senderRole: 'student' | 'advisor' | 'sales';
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
    logInfo('Danışman mesajları isteği alındı');
    
    // Kullanıcı e-postasını header'dan al
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      logError('Kullanıcı e-postası bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    
    logInfo('Danışman mesajları getiriliyor', { userEmail });

    // messages.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    
    // Dosya varlığını kontrol et
    if (!fs.existsSync(filePath)) {
      logInfo('Mesaj veritabanı bulunamadı, boş liste döndürülüyor');
      return NextResponse.json({
        success: true,
        tickets: []
      });
    }

    // Dosyayı oku
    let data: MessageData;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      logError('Mesaj veritabanı okuma hatası:', error);
      return NextResponse.json(
        { success: false, error: 'Mesaj veritabanı okunamadı' },
        { status: 500 }
      );
    }

    // Danışmanın mesajlarını filtrele
    const messages = data.messages || [];
    const advisorMessages = messages.filter((message: any) => 
      message.senderEmail.toLowerCase() === userEmail.toLowerCase() || 
      message.receiverEmail.toLowerCase() === userEmail.toLowerCase()
    );

    // Öğrenci bilgilerini al
    const customersPath = path.join(process.cwd(), 'data', 'customers.json');
    let students: any[] = [];
    
    if (fs.existsSync(customersPath)) {
      try {
        const customersContent = fs.readFileSync(customersPath, 'utf-8');
        const customersData = JSON.parse(customersContent);
        students = customersData.customers || [];
      } catch (error) {
        logError('Öğrenci listesi okuma hatası:', error);
      }
    }

    // Mesajları konulara (ticket) grupla
    const tickets = advisorMessages.reduce((acc: any[], message: any) => {
      const ticketId = message.replyToId || message.id;
      const existingTicket = acc.find(t => t.id === ticketId);
      
      // Mesajın öğrenci bilgilerini bul
      const studentEmail = message.senderRole === 'student' ? message.senderEmail : message.receiverEmail;
      const student = students.find(s => s.email.toLowerCase() === studentEmail.toLowerCase());
      
      if (existingTicket) {
        // Mevcut konuya mesaj ekle
        existingTicket.messages.push({
          sender: message.senderEmail.toLowerCase() === userEmail.toLowerCase() ? 'advisor' : 'student',
          content: message.content,
          timestamp: message.createdAt
        });
        
        // Konu bilgilerini güncelle
        existingTicket.isRead = existingTicket.isRead && message.isRead;
        existingTicket.date = message.createdAt;
        existingTicket.preview = message.content;
      } else {
        // Yeni konu oluştur
        acc.push({
          id: ticketId,
          subject: message.subject || 'Yeni Konu',
          preview: message.content,
          date: message.createdAt,
          isRead: message.isRead,
          studentId: student?.lead_id || studentEmail,
          studentEmail: studentEmail,
          studentName: student?.name || studentEmail.split('@')[0],
          messages: [{
            sender: message.senderEmail.toLowerCase() === userEmail.toLowerCase() ? 'advisor' : 'student',
            content: message.content,
            timestamp: message.createdAt
          }]
        });
      }
      
      return acc;
    }, []);

    logInfo('Danışman mesajları başarıyla getirildi:', userEmail);
    
    return NextResponse.json({
      success: true,
      tickets: tickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
    
  } catch (error) {
    logError('Danışman mesajları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar alınamadı' },
      { status: 500 }
    );
  }
} 