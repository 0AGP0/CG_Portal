import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // E-posta kontrolü
    if (!body.email) {
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Öğrenciyi e-posta adresine göre bul
    const student = await getRecordByEmail(body.email);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Gerçek uygulamada burada parola kontrolü, kimlik doğrulama 
    // ve yetkilendirme işlemleri yapılır
    
    // Başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        student: {
          lead_id: student.lead_id || '1',
          id: student.id || '1',
          name: student.name,
          email: student.email,
          processStarted: student.processStarted || false,
          advisorId: 'adv-1' // Gerçek uygulamada dinamik olarak atanır
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Öğrenci girişi hatası', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 