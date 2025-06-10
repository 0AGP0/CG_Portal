import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Ticket {
  id: string | number;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  studentId?: string;
  studentEmail?: string;
  messages: Array<{
    sender: 'user' | 'advisor';
    content: string;
    timestamp: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      console.error('Kullanıcı email bilgisi bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgisi bulunamadı' },
        { status: 401 }
      );
    }

    // messages.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    
    // Dosya varlığını kontrol et
    if (!fs.existsSync(filePath)) {
      console.log('Mesaj veritabanı bulunamadı, boş liste döndürülüyor');
      return NextResponse.json({
        success: true,
        tickets: []
      });
    }

    // Dosyayı oku
    let data;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Mesaj veritabanı okuma hatası:', error);
      return NextResponse.json(
        { success: false, error: 'Mesaj veritabanı okunamadı' },
        { status: 500 }
      );
    }

    // Kullanıcının mesajlarını filtrele
    const messages = data.messages || [];
    const userMessages = messages.filter((message: any) => 
      message.senderEmail.toLowerCase() === email.toLowerCase() || 
      message.receiverEmail.toLowerCase() === email.toLowerCase()
    );

    // Mesajları konulara (ticket) grupla
    const tickets = userMessages.reduce((acc: Ticket[], message: any) => {
      const ticketId = message.replyToId || message.id;
      const existingTicket = acc.find(t => t.id === ticketId);
      
      if (existingTicket) {
        // Mevcut konuya mesaj ekle
        existingTicket.messages.push({
          sender: message.senderEmail.toLowerCase() === email.toLowerCase() ? 'user' : 'advisor',
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
          studentId: message.senderEmail.toLowerCase() === email.toLowerCase() ? message.receiverEmail : message.senderEmail,
          studentEmail: message.senderEmail.toLowerCase() === email.toLowerCase() ? message.receiverEmail : message.senderEmail,
          messages: [{
            sender: message.senderEmail.toLowerCase() === email.toLowerCase() ? 'user' : 'advisor',
            content: message.content,
            timestamp: message.createdAt
          }]
        });
      }
      
      return acc;
    }, []);

    console.log('Öğrenci mesajları başarıyla getirildi:', email);
    
    return NextResponse.json({
      success: true,
      tickets: tickets.sort((a: Ticket, b: Ticket) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    });
    
  } catch (error) {
    console.error('Öğrenci mesajları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesajlar alınamadı' },
      { status: 500 }
    );
  }
} 