import { NextRequest, NextResponse } from 'next/server';
import { getMessageById, markMessageAsRead } from '@/utils/database';
import { logError } from '@/utils/logger';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const messageId = params.id;
    
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Mesajı getir
    const message = await getMessageById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Kullanıcının bu mesaja erişim yetkisi var mı kontrol et
    if (message.senderEmail.toLowerCase() !== email.toLowerCase() && 
        message.receiverEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Bu mesaja erişim izniniz yok' }, 
        { status: 403 }
      );
    }
    
    // Eğer kullanıcı mesajın alıcısıysa ve mesaj okunmamışsa okundu olarak işaretle
    if (message.receiverEmail.toLowerCase() === email.toLowerCase() && !message.isRead) {
      await markMessageAsRead(messageId);
      message.isRead = true;
    }
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message
    });
    
  } catch (error) {
    logError('Mesaj detayı hatası', error);
    return NextResponse.json(
      { error: 'Mesaj alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const messageId = params.id;
    
    // Kullanıcı e-posta adresini al
    const email = request.headers.get('x-user-email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Mesajı getir
    const message = await getMessageById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Kullanıcının bu mesajın alıcısı olup olmadığını kontrol et
    if (message.receiverEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Bu mesajı okundu olarak işaretleme izniniz yok' }, 
        { status: 403 }
      );
    }
    
    // Mesajı okundu olarak işaretle
    const updatedMessage = await markMessageAsRead(messageId);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
    
  } catch (error) {
    logError('Mesaj okundu işaretleme hatası', error);
    return NextResponse.json(
      { error: 'Mesaj okundu olarak işaretlenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 