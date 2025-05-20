import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail, getAdvisorStudents } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // Oturum doğrulama işlemi normalde burada yapılır
    // Şu an için basit bir gelen header doğrulaması yapacağız
    const email = request.headers.get('x-user-email') || '';
    
    if (!email) {
      return NextResponse.json({ error: 'Oturum bilgisi gerekli' }, { status: 401 });
    }
    
    // Danışmanı e-posta ile bul
    const advisor = await getAdvisorByEmail(email);
    
    if (!advisor) {
      return NextResponse.json({ error: 'Danışman bulunamadı' }, { status: 404 });
    }
    
    // Danışmanın öğrencilerini getir
    const students = await getAdvisorStudents(advisor.id);
    
    return NextResponse.json({ 
      success: true, 
      students: students.map(student => ({
        id: student.lead_id,
        email: student.email,
        name: student.name,
        stage: student.stage,
        university: student.university_name || student.university,
        program: student.university_department || student.program,
        visa_appointment_date: student.visa_appointment_date,
        high_school_name: student.high_school_name,
        language_level: student.language_level,
        documents: student.documents || [],
        updatedAt: student.updatedAt
      }))
    });
  } catch (error) {
    console.error('Danışman öğrencileri getirme hatası:', error);
    return NextResponse.json({ error: 'Veri alma hatası' }, { status: 500 });
  }
} 