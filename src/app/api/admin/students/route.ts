import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

// GET isteği - Tüm öğrencileri getir
export async function GET(request: NextRequest) {
  logger.info('=== ADMIN STUDENTS API BAŞLADI ===');
  
  try {
    // Statik test verisi
    const testStudents = [
      {
        id: 'test1@example.com',
        name: 'Test Öğrenci 1',
        email: 'test1@example.com',
        phone: '5551234567',
        advisor: 'Emre Danışman',
        status: 'Hazırlık Aşaması',
        processStarted: false,
        createdAt: '2025-06-30T12:00:00Z',
        updatedAt: '2025-06-30T12:00:00Z',
        advisorId: 1,
        advisorEmail: 'emre.danisman@example.com',
        documents: []
      }
    ];
    
    logger.info('Statik test verisi döndürülüyor:', { studentCount: testStudents.length });
    
    return NextResponse.json({
      success: true,
      students: testStudents,
      message: 'Statik test verisi'
    });
    
  } catch (error: any) {
    logger.error('=== ADMIN STUDENTS API HATASI ===');
    logger.error('Hata mesajı:', error.message);
    logger.error('Hata stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Öğrenci listesi alınırken bir hata oluştu', details: error.message },
      { status: 500 }
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
    
    logger.info('Yeni öğrenci oluşturma isteği:', { email: body.email, name: body.name });
    
    // Test için statik yanıt
    const newStudent = {
      id: body.email,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      advisor: 'Atanmadı',
      status: 'Hazırlık Aşaması',
      processStarted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    logger.info('Test öğrenci oluşturuldu', { email: newStudent.email });
    
    return NextResponse.json({
      success: true,
      student: newStudent,
      message: 'Test modu - gerçek veritabanı işlemi yapılmadı'
    }, { status: 201 });
    
  } catch (error: any) {
    logger.error('Öğrenci oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}