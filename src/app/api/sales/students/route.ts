import { NextRequest, NextResponse } from 'next/server';
import { getSalesPersonByEmail, getSalesPersonStudents } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Satış ekibi üyesinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // Satış ekibi üyesini bul
    const salesPerson = await getSalesPersonByEmail(userEmail);
    
    if (!salesPerson) {
      return NextResponse.json(
        { error: 'Satış ekibi üyesi bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Satış ekibi üyesine atanmış öğrencileri getir
    const students = await getSalesPersonStudents(salesPerson.id);
    
    return NextResponse.json(
      { 
        success: true, 
        students: students.map(student => ({
          id: student.lead_id || student.email,
          name: student.name || 'İsimsiz Öğrenci',
          email: student.email,
          processStarted: student.processStarted || false,
          stage: student.stage || 'new',
          university: student.university || null,
          program: student.program || null,
          updatedAt: student.updatedAt,
          unreadMessages: 0 // Okunmamış mesaj sayısı burada eklenecek (opsiyonel)
        }))
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Satış ekibi öğrenci listesi hatası', error);
    return NextResponse.json(
      { error: 'Öğrenci listesi alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 