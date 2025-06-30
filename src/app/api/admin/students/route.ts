import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents, createStudent } from '@/lib/db';
import { logger } from '@/utils/logger';

// GET isteği - Tüm öğrencileri getir
export async function GET(request: NextRequest) {
  try {
    logger.info('Admin öğrenci listesi isteği alındı');
    
    // Veritabanından tüm öğrencileri getir
    const students = await getAllStudents();
    
    // Öğrenci verilerini formatla
    const formattedStudents = students.map(student => ({
      id: student.email,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      advisor: student.advisor_name || 'Atanmadı',
      status: student.stage || 'Beklemede',
      processStarted: student.process_started || false,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      advisorId: student.advisor_id,
      advisorEmail: student.advisor_email,
      salesId: student.sales_id,
      salesName: student.sales_name,
      salesEmail: student.sales_email,
      documents: student.documents || []
    }));
    
    // Response header'larını ayarla
    const headers = new Headers();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    logger.info('Admin öğrenci listesi başarıyla getirildi', { 
      studentCount: formattedStudents.length 
    });
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        students: formattedStudents
      }, null, 2),
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    logger.error('Admin öğrenci listesi hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci listesi alınırken bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

// POST isteği - Yeni öğrenci oluştur
export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    
    // Gerekli alanlar mevcut mu kontrol et
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Ad ve e-posta alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }
    
    // Yeni öğrenciyi veritabanında oluştur
    const newStudent = await createStudent({
      email: body.email,
      name: body.name,
      phone: body.phone || '',
      stage: 'Hazırlık Aşaması',
      process_started: false,
      advisor_id: undefined,
      advisor_name: undefined,
      advisor_email: undefined,
      documents: []
    });
    
    logger.info('Yeni öğrenci oluşturuldu', { email: newStudent.email });
    
    // Yanıt olarak oluşturulan öğrenciyi döndür
    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.email,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        advisor: newStudent.advisor_name || 'Atanmadı',
        status: newStudent.stage,
        processStarted: newStudent.process_started,
        createdAt: newStudent.created_at,
        updatedAt: newStudent.updated_at
      }
    }, { status: 201 });
  } catch (error) {
    logger.error('Öğrenci oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}