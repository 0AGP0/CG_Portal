import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';
import { verifyToken } from '@/utils/security';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    logger.info('Danışman bilgisi isteği alındı:', decodedEmail);

    // Token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      logger.error('Geçersiz token formatı');
      return NextResponse.json(
        { error: 'Geçersiz token formatı' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      logger.error('Geçersiz token');
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Yetkilendirme kontrolleri
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userEmail || !userRole) {
      logger.error('Yetkilendirme başlıkları eksik:', { userEmail, userRole });
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    // Token'daki bilgilerle header bilgilerini karşılaştır
    if (decodedToken.email !== userEmail || decodedToken.role !== userRole) {
      logger.error('Token ve header bilgileri uyuşmuyor:', {
        token: decodedToken,
        headers: { userEmail, userRole }
      });
      return NextResponse.json(
        { error: 'Geçersiz yetkilendirme bilgileri' },
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

    // Danışmanı veritabanından getir
    const advisor = await getAdvisorByEmail(decodedEmail);
    
    logger.info('Danışman arama sonucu:', advisor ? {
      id: advisor.id,
      email: advisor.email,
      name: advisor.name
    } : 'Danışman bulunamadı');

    if (!advisor) {
      logger.error('Danışman bulunamadı:', decodedEmail);
      return NextResponse.json(
        { error: 'Danışman bulunamadı' },
        { status: 404 }
      );
    }

    // Admin değilse ve kendi bilgilerini istemiyorsa erişimi engelle
    if (userRole !== 'admin' && userEmail.toLowerCase() !== decodedEmail.toLowerCase()) {
      logger.error('Yetkisiz erişim denemesi:', {
        requestedEmail: decodedEmail,
        userEmail,
        userRole
      });
      return NextResponse.json(
        { error: 'Bu danışmanın bilgilerine erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Başarılı yanıt
    logger.info('Danışman bilgileri başarıyla getirildi:', decodedEmail);
    return NextResponse.json({
      success: true,
      advisor: {
        id: advisor.id,
        email: advisor.email,
        name: advisor.name,
        studentIds: advisor.studentIds || [],
        updatedAt: advisor.updated_at
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