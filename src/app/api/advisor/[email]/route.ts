import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = decodeURIComponent(params.email);
    logger.info('Danışman bilgisi isteği alındı:', email);

    // Yetkilendirme kontrolleri
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const authHeader = request.headers.get('authorization');

    if (!userEmail || !userRole || !authHeader) {
      logger.error('Yetkilendirme başlıkları eksik:', { userEmail, userRole, hasAuth: !!authHeader });
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    if (userRole !== 'advisor' && userRole !== 'admin') {
      logger.error('Geçersiz kullanıcı rolü:', userRole);
      return NextResponse.json(
        { error: 'Bu işlem için danışman yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Token kontrolü
    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.error('Token bulunamadı');
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Danışman veritabanını oku
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
      a.email.toLowerCase() === email.toLowerCase()
    );

    logger.info('Danışman arama sonucu:', advisor ? {
      id: advisor.id,
      email: advisor.email,
      name: advisor.name
    } : 'Danışman bulunamadı');

    if (!advisor) {
      logger.error('Danışman bulunamadı:', email);
      return NextResponse.json(
        { error: 'Danışman bulunamadı' },
        { status: 404 }
      );
    }

    // Admin değilse ve kendi bilgilerini istemiyorsa erişimi engelle
    if (userRole !== 'admin' && userEmail.toLowerCase() !== email.toLowerCase()) {
      logger.error('Yetkisiz erişim denemesi:', {
        requestedEmail: email,
        userEmail,
        userRole
      });
      return NextResponse.json(
        { error: 'Bu danışmanın bilgilerine erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Başarılı yanıt
    logger.info('Danışman bilgileri başarıyla getirildi:', email);
    return NextResponse.json({
      success: true,
      advisor: {
        id: advisor.id,
        email: advisor.email,
        name: advisor.name,
        studentIds: advisor.studentIds || [],
        updatedAt: advisor.updatedAt
      }
    });

  } catch (error) {
    logger.error('Danışman bilgisi getirme hatası:', error);
    return NextResponse.json(
      { error: 'Danışman bilgisi alınamadı' },
      { status: 500 }
    );
  }
} 