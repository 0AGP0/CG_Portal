import { NextRequest, NextResponse } from 'next/server';
import { getStudentsByAdvisor, getAdvisorByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Test danışman API isteği alındı');
    
    // Test için sabit bir danışman e-postası kullan
    const testEmail = 'your-real-advisor@email.com'; // Bu e-postayı gerçek danışman e-postası ile değiştirin
    
    logger.info('Test danışman e-postası:', testEmail);

    // Önce danışmanın varlığını kontrol et
    logger.info('Danışman kontrolü yapılıyor...');
    const advisor = await getAdvisorByEmail(testEmail);
    if (!advisor) {
      logger.error('Test danışman bulunamadı:', testEmail);
      return NextResponse.json(
        { success: false, error: 'Test danışman bulunamadı', testEmail },
        { status: 404 }
      );
    }
    
    logger.info('Test danışman bulundu:', { advisorEmail: advisor.email, advisorName: advisor.name });

    // Danışmanın öğrencilerini getir
    logger.info('Test öğrenci listesi getiriliyor...');
    const students = await getStudentsByAdvisor(testEmail);
    logger.info('Test ham öğrenci verileri:', { 
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

    logger.info('Test danışman öğrenci listesi başarıyla getirildi', { 
      advisorEmail: testEmail,
      studentCount: formattedStudents.length 
    });

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      advisor: {
        email: advisor.email,
        name: advisor.name
      }
    });
  } catch (error) {
    logger.error('Test danışman API hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Test API hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 