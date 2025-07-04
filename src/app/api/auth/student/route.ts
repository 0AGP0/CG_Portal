import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';
import { generateToken } from '@/utils/security';

export async function POST(request: NextRequest) {
  try {
    logger.info('Öğrenci girişi isteği alındı');
    
    const body = await request.json();
    logger.info('Gelen veri:', body);
    
    // E-posta kontrolü
    if (!body.email) {
      logger.error('E-posta eksik');
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
    // Öğrenciyi e-posta adresine göre bul
      const query = `
        SELECT 
          id,
          email,
          name,
          process_started,
          created_at,
          updated_at
        FROM students 
        WHERE email = $1
      `;
      
      const result = await client.query(query, [body.email]);
      const student = result.rows[0];
    
    if (!student) {
        // Öğrenci bulunamadıysa giriş reddedilir
      logger.error('Öğrenci bulunamadı, giriş reddedildi:', body.email);
        return NextResponse.json(
          { 
            error: 'Bu e-posta adresi ile kayıtlı öğrenci bulunamadı. Lütfen admin ile iletişime geçin.',
            message: 'Öğrenci kaydı bulunamadı'
          }, 
          { status: 404 }
        );
    }
    
      // Token oluştur
      const token = generateToken({
        id: student.id.toString(),
        email: student.email,
        role: 'student'
      });

      if (!token) {
        logger.error('Token oluşturulamadı');
        return NextResponse.json(
          { error: 'Giriş yapılırken bir hata oluştu' },
          { status: 500 }
        );
      }

      // Mevcut öğrenci için başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        token,
        user: {
          id: student.id,
        name: student.name,
        email: student.email,
          role: 'student',
          processStarted: student.process_started || false
      }
    }, 
    { status: 200 }
  );
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Öğrenci girişi hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 