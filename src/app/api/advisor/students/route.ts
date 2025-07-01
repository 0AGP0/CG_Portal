import { NextRequest, NextResponse } from 'next/server';
import { getStudentsByAdvisor, getAdvisorByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Danışman öğrenci listesi isteği alındı');
    
    // Kullanıcı e-postasını header'dan al
    const userEmail = request.headers.get('x-user-email');
    logger.info('Danışman API: Header bilgileri', { 
      userEmail,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    if (!userEmail) {
      logger.error('Kullanıcı e-postası bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    
    logger.info('Danışman öğrenci listesi getiriliyor', { userEmail });

    // Önce danışmanın varlığını kontrol et
    logger.info('Danışman kontrolü yapılıyor...');
    const advisor = await getAdvisorByEmail(userEmail);
    if (!advisor) {
      logger.error('Danışman bulunamadı:', userEmail);
      return NextResponse.json(
        { success: false, error: 'Danışman bulunamadı' },
        { status: 404 }
      );
    }
    
    logger.info('Danışman bulundu:', { advisorEmail: advisor.email, advisorName: advisor.name });

    // Danışmanın öğrencilerini getir
    logger.info('Öğrenci listesi getiriliyor...');
    const students = await getStudentsByAdvisor(userEmail);
    logger.info('Ham öğrenci verileri:', { 
      count: students.length,
      students: students.map(s => ({ email: s.email, name: s.name, advisor_email: s.advisor_email }))
    });
    
    // Öğrenci verilerini formatla
    const formattedStudents = students.map(student => ({
      id: student.email,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      stage: student.stage || 'Hazırlık Aşaması',
      processStarted: student.process_started || false,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      documents: student.documents || []
    }));

    logger.info('Danışman öğrenci listesi başarıyla getirildi', { 
      advisorEmail: userEmail,
      studentCount: formattedStudents.length 
    });

    return NextResponse.json({
      success: true,
      students: formattedStudents
    });
  } catch (error) {
    logger.error('Danışman öğrenci listesi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci listesi alınamadı' },
      { status: 500 }
    );
  }
} 