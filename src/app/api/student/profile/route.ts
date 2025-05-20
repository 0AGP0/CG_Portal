import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Öğrencinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // Öğrenciyi bul
    const student = await getRecordByEmail(userEmail);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci kaydı bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Öğrenci profil bilgilerini formatla ve döndür
    return NextResponse.json(
      { 
        success: true, 
        student: {
          name: student.name || userEmail.split('@')[0],
          email: student.email,
          studentId: student.lead_id || 'Henüz Oluşturulmadı',
          university: student.university || 'Henüz Belirlenmedi',
          program: student.program || 'Henüz Belirlenmedi',
          processStarted: student.processStarted || false,
          counselor: student.advisorName || 'Henüz Atanmadı',
          counselorEmail: student.advisorEmail || null,
          salesPerson: student.salesName || 'Henüz Atanmadı',
          salesEmail: student.salesEmail || null,
          salesPersonEmail: student.salesEmail || null,
          lastLogin: new Date().toLocaleDateString('tr-TR'),
          alerts: [
            // Varsayılan uyarılar
            { id: 1, type: 'warning', message: 'Profilinizi tamamlamanız gerekiyor.' }
          ]
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Öğrenci profil bilgisi hatası', error);
    return NextResponse.json(
      { error: 'Profil bilgisi alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 