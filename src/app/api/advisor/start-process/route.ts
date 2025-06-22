import { NextRequest, NextResponse } from 'next/server';
import { getRecordByEmail, updateOrCreateRecord } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Danışman bilgilerini doğrula
    const advisorEmail = request.headers.get('x-user-email');
    if (!advisorEmail) {
      return NextResponse.json(
        { error: 'Oturum bilgisi gerekli' }, 
        { status: 401 }
      );
    }
    
    // Öğrenci ID kontrol et
    if (!body.studentId) {
      return NextResponse.json(
        { error: 'Öğrenci ID bilgisi gerekli' }, 
        { status: 400 }
      );
    }
    
    // Önce öğrenciyi ID ile bul (gerçek sistemde ID ile arama yapılacak)
    // Şu aşamada öğrenci listesi üzerinden API ile bulma yöntemi kullanılıyor
    const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/advisor/students`, {
      headers: {
        'x-user-email': advisorEmail
      }
    });
    
    if (!studentsResponse.ok) {
      return NextResponse.json(
        { error: 'Öğrenci bilgileri alınamadı' }, 
        { status: 500 }
      );
    }
    
    const studentsData = await studentsResponse.json();
    const student = studentsData.students.find((s: any) => s.id === body.studentId);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Öğrencinin sürecini başlat
    const updatedStudent = await updateOrCreateRecord({
      email: student.email,
      processStarted: true,
      stage: 'Süreç Başlatıldı',
      processStartDate: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Öğrenci süreci başarıyla başlatıldı',
      student: {
        id: updatedStudent.lead_id || updatedStudent.id,
        email: updatedStudent.email,
        name: updatedStudent.name,
        processStarted: updatedStudent.processStarted,
        stage: updatedStudent.stage,
        updatedAt: updatedStudent.updatedAt
      }
    });
    
  } catch (error) {
    logError('Öğrenci süreci başlatma hatası', error);
    return NextResponse.json(
      { error: 'Süreç başlatılırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 