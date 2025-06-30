import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

// GET isteği - Tüm öğrencileri getir
export async function GET(request: NextRequest) {
  try {
    logger.info('=== ADMIN STUDENTS API BAŞLADI ===');
    
    const client = await pool.connect();
    logger.info('Veritabanı bağlantısı kuruldu');
    
    try {
      // En basit sorgu ile test
      const query = 'SELECT COUNT(*) as count FROM students';
      logger.info('SQL sorgusu:', query);
      
      const result = await client.query(query);
      logger.info('Sorgu sonucu:', result.rows);
      
      // Şimdi gerçek sorgu
      const realQuery = 'SELECT id, email, name FROM students LIMIT 5';
      logger.info('Gerçek SQL sorgusu:', realQuery);
      
      const realResult = await client.query(realQuery);
      logger.info('Gerçek sorgu sonucu:', { rowCount: realResult.rowCount, rows: realResult.rows });
      
      return NextResponse.json({
        success: true,
        students: realResult.rows,
        count: result.rows[0].count
      });
      
    } finally {
      client.release();
      logger.info('Veritabanı bağlantısı kapatıldı');
    }
    
  } catch (error: any) {
    logger.error('=== ADMIN STUDENTS API HATASI ===');
    logger.error('Hata mesajı:', error.message);
    logger.error('Hata kodu:', error.code);
    logger.error('Hata detayı:', error.detail);
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
    
    const client = await pool.connect();
    try {
      // Yeni öğrenciyi veritabanında oluştur
      const query = `
        INSERT INTO students (email, name, phone, stage, process_started, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await client.query(query, [
        body.email,
        body.name,
        body.phone || '',
        'Hazırlık Aşaması',
        false
      ]);
      
      const newStudent = result.rows[0];
      logger.info('Yeni öğrenci oluşturuldu', { email: newStudent.email });
      
      // Yanıt olarak oluşturulan öğrenciyi döndür
      return NextResponse.json({
        success: true,
        student: {
          id: newStudent.email,
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.phone,
          advisor: 'Atanmadı',
          status: newStudent.stage,
          processStarted: newStudent.process_started,
          createdAt: newStudent.created_at,
          updatedAt: newStudent.updated_at
        }
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Öğrenci oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}