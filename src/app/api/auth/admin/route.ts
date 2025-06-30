import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';
import { generateToken } from '@/utils/security';

export async function POST(request: NextRequest) {
  try {
    logger.info('Admin girişi isteği alındı');
    
    const body = await request.json();
    logger.info('Gelen veri:', body);
    
    // E-posta ve şifre kontrolü
    if (!body.email || !body.password) {
      logger.error('E-posta veya şifre eksik');
      return NextResponse.json(
        { error: 'E-posta adresi ve şifre gereklidir' }, 
        { status: 400 }
      );
    }

    logger.info('Veritabanına bağlanılıyor...');
    const client = await pool.connect();
    logger.info('Veritabanı bağlantısı başarılı');
    
    try {
      // Admin'i veritabanından kontrol et
      const query = `
        SELECT 
          id,
          email,
          name,
          role,
          password,
          created_at,
          updated_at
        FROM admins 
        WHERE email = $1
      `;
      
      logger.info('Sorgu çalıştırılıyor:', { email: body.email });
      const result = await client.query(query, [body.email]);
      logger.info('Sorgu sonucu:', { rowCount: result.rowCount, rows: result.rows });
      
      const admin = result.rows[0];

      if (!admin) {
        logger.error('Admin bulunamadı:', body.email);
        return NextResponse.json(
          { error: 'Bu e-posta adresi ile kayıtlı admin bulunamadı' }, 
          { status: 401 }
        );
      }

      logger.info('Admin bulundu:', { id: admin.id, email: admin.email, hasPassword: !!admin.password });

      // Şifre kontrolü
      if (admin.password !== body.password) {
        logger.error('Yanlış şifre:', { 
          provided: body.password, 
          stored: admin.password,
          email: body.email 
        });
        return NextResponse.json(
          { error: 'Yanlış şifre' }, 
          { status: 401 }
        );
      }

      logger.info('Şifre doğru, token oluşturuluyor...');

      // Token oluştur
      const token = generateToken({
        id: admin.id.toString(),
        email: admin.email,
        role: 'admin'
      });

      if (!token) {
        logger.error('Token oluşturulamadı');
        return NextResponse.json(
          { error: 'Oturum başlatılamadı' },
          { status: 500 }
        );
      }

      logger.info('Token oluşturuldu');

      // Başarılı yanıt
      const response = {
        success: true,
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'admin'
        }
      };

      logger.info('Admin girişi başarılı:', { email: admin.email });
      return NextResponse.json(response);

    } finally {
      client.release();
      logger.info('Veritabanı bağlantısı kapatıldı');
    }
    
  } catch (error) {
    logger.error('Admin girişi hatası:', error);
    return NextResponse.json(
      { error: 'Admin girişi yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 