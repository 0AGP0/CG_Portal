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
    
    if (!body.senderRole || !['student', 'advisor', 'sales'].includes(body.senderRole)) {
      logError('Geçersiz gönderen rolü:', body.senderRole);
      return NextResponse.json(
        { success: false, error: 'Gönderen rolü geçerli değil' }, 
        { status: 400 }
      );
    }

    // messages.json dosyasını oku veya oluştur
    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    let data: MessageData = { messages: [] };
    
    if (fs.existsSync(filePath)) {
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
    }

    // Yeni mesaj oluştur
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderEmail: senderEmail.toLowerCase(),
      receiverEmail: body.receiverEmail.toLowerCase(),
      senderRole: body.senderRole as 'student' | 'advisor' | 'sales',
      content: body.content,
      subject: body.subject || 'Yeni Mesaj',
      category: body.category || 'general',
      replyToId: body.replyToId,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Mesajı kaydet
    data.messages.push(newMessage);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      logError('Mesaj kaydetme hatası:', error);
      return NextResponse.json(
        { success: false, error: 'Mesaj kaydedilemedi' },
        { status: 500 }
      );
    }

    logInfo('Mesaj başarıyla oluşturuldu:', newMessage.id);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: newMessage
    }, { status: 201 });
    
  } catch (error) {
    logError('Mesaj gönderme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 