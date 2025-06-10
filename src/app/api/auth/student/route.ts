import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Öğrenci girişi isteği alındı');
    
    const body = await request.json();
    logger.info('Gelen veri:', body);
    
    // E-posta kontrolü
    if (!body.email) {
      logger.error('E-posta eksik');
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Öğrenciyi e-posta adresine göre bul
    const student = await getRecordByEmail(body.email);
    logger.info('Bulunan öğrenci:', student);
    
    if (!student) {
      // Öğrenci bulunamadıysa yeni kayıt oluştur
      logger.info('Öğrenci bulunamadı, yeni kayıt oluşturuluyor');
      const newStudent = {
        id: `stu-${Date.now()}`,
        email: body.email,
        name: body.email.split('@')[0].split('.').map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ') || 'Yeni Öğrenci',
        role: 'student', // Role bilgisini ekle
        processStarted: false,
        advisorId: 'adv-1',
        updatedAt: new Date().toISOString()
      };
      
      // Başarılı giriş
      return NextResponse.json(
        { 
          success: true, 
          message: 'Giriş başarılı',
          user: { // student yerine user kullan
            id: newStudent.id,
            name: newStudent.name,
            email: newStudent.email,
            role: 'student', // Role bilgisini ekle
            processStarted: false,
            advisorId: 'adv-1'
          }
        }, 
        { status: 200 }
      );
    }
    
    // Başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        user: { // student yerine user kullan
          id: student.lead_id || `stu-${Date.now()}`,
          name: student.name,
          email: student.email,
          role: 'student', // Role bilgisini ekle
          processStarted: student.processStarted || false,
          advisorId: student.advisorId || 'adv-1'
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logger.error('Öğrenci girişi hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 