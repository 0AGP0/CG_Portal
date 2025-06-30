import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';
import { generateToken } from '@/utils/security';
import { verifyToken } from '@/utils/security';

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

    const client = await pool.connect();
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
      
      const result = await client.query(query, [body.email]);
      const admin = result.rows[0];

      if (!admin) {
        logger.error('Admin bulunamadı:', body.email);
        return NextResponse.json(
          { error: 'Bu e-posta adresi ile kayıtlı admin bulunamadı' }, 
          { status: 401 }
        );
      }

      // Şifre kontrolü
      if (admin.password !== body.password) {
        logger.error('Yanlış şifre:', body.email);
        return NextResponse.json(
          { error: 'Yanlış şifre' }, 
          { status: 401 }
        );
      }

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
    }
    
  } catch (error) {
    logger.error('Admin girişi hatası:', error);
    return NextResponse.json(
      { error: 'Admin girişi yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Admin tablosunu oluştur
export async function createAdminTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Varsayılan admin hesabını ekle (eğer yoksa)
    const defaultAdmin = {
      email: 'admin@campusglobal.com',
      name: 'Admin User'
    };

    await client.query(`
      INSERT INTO admins (email, name)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `, [defaultAdmin.email, defaultAdmin.name]);

    logger.info('Admin tablosu ve varsayılan admin hesabı oluşturuldu');
  } catch (error) {
    logger.error('Admin tablosu oluşturma hatası:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Uygulama başladığında admin tablosunu oluştur
createAdminTable().catch(error => {
  logger.error('Admin tablosu oluşturulurken hata:', error);
}); 