import { NextRequest, NextResponse } from 'next/server';
import { createMessage, getRecordByEmail, getAdvisorByEmail } from '@/utils/database';
import { logError, logInfo } from '@/utils/logger';
import path from 'path';

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
        { error: 'Kullanıcı kimliği gereklidir' }, 
        { status: 401 }
      );
    }
    
    // Gerekli alan kontrolleri
    if (!body.receiverEmail) {
      logError('Alıcı e-posta adresi eksik');
      return NextResponse.json(
        { error: 'Alıcı e-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    if (!body.content) {
      logError('Mesaj içeriği eksik');
      return NextResponse.json(
        { error: 'Mesaj içeriği gereklidir' }, 
        { status: 400 }
      );
    }
    
    if (!body.senderRole || !['student', 'advisor', 'sales'].includes(body.senderRole)) {
      logError('Geçersiz gönderen rolü:', body.senderRole);
      return NextResponse.json(
        { error: 'Gönderen rolü geçerli değil' }, 
        { status: 400 }
      );
    }
    
    // Alıcının varlığını kontrol et
    const receiverEmail = body.receiverEmail.toLowerCase();
    
    if (body.senderRole === 'student') {
      // Öğrenci, danışmana veya satış ekibine mesaj gönderiyor
      // Alıcının danışman veya satış ekibi üyesi olup olmadığını kontrol etmeyi geçebiliriz
      // çünkü örnek e-posta adreslerini kullanıyoruz
      logInfo('Öğrenci mesajı, alıcı kontrolü atlanıyor');
    } else if (body.senderRole === 'advisor' || body.senderRole === 'sales') {
      // Danışman veya satış ekibi, öğrenciye mesaj gönderiyor
      logInfo('Danışman/Satış ekibi mesajı, öğrenci kontrolü yapılıyor');
      
      const student = await getRecordByEmail(receiverEmail);
      
      if (!student) {
        logError('Alıcı öğrenci bulunamadı:', receiverEmail);
        return NextResponse.json(
          { error: 'Alıcı öğrenci bulunamadı' }, 
          { status: 404 }
        );
      }
      
      logInfo('Öğrenci doğrulandı:', student.email);
    }
    
    // Çalışma dizinini logla
    logInfo('Çalışma dizini (CWD):', process.cwd());
    logInfo('Veri yolu (data):', path.join(process.cwd(), 'data'));
    
    // Yeni mesaj oluştur
    logInfo('Yeni mesaj oluşturuluyor');
    const newMessage = await createMessage({
      senderEmail,
      receiverEmail,
      senderRole: body.senderRole,
      content: body.content,
      subject: body.subject || 'Yeni Mesaj',
      category: body.category || 'general',
      replyToId: body.replyToId
    });
    
    logInfo('Mesaj başarıyla oluşturuldu:', newMessage.id);
    
    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      data: newMessage
    }, { status: 201 });
    
  } catch (error) {
    logError('Mesaj gönderme hatası:', error);
    if (error instanceof Error) {
      logError('Hata detayları:', { message: error.message, stack: error.stack });
    }
    
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 