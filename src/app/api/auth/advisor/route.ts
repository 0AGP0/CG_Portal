import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Danışman girişi isteği alındı');
    
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
    
    // advisors.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'advisors.json');
    logger.info('Danışman veritabanı dosyası:', filePath);
    
    if (!fs.existsSync(filePath)) {
      logger.error('Danışman veritabanı bulunamadı:', filePath);
      return NextResponse.json(
        { error: 'Danışman veritabanı bulunamadı' },
        { status: 500 }
      );
    }
    
    // Dosyayı oku
    let data;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileContent);
      logger.info('Veritabanı dosyası başarıyla okundu');
    } catch (error) {
      logger.error('Veritabanı okuma hatası:', error);
      return NextResponse.json(
        { error: 'Veritabanı okunamadı' },
        { status: 500 }
      );
    }
    
    // Danışmanı bul
    const advisor = data.advisors?.find((a: any) => 
      a.email.toLowerCase() === body.email.toLowerCase()
    );
    
    logger.info('Danışman arama sonucu:', advisor ? {
      id: advisor.id,
      email: advisor.email,
      name: advisor.name
    } : 'Danışman bulunamadı');
    
    if (!advisor) {
      logger.error('Danışman bulunamadı:', body.email);
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı danışman bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // Başarılı giriş
    logger.info('Danışman girişi başarılı:', {
      id: advisor.id,
      email: advisor.email,
      name: advisor.name
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        user: {
          id: advisor.id,
          name: advisor.name,
          email: advisor.email,
          role: 'advisor',
          studentIds: advisor.studentIds || []
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logger.error('Danışman girişi hatası:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 