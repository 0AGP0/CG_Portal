import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/security';
import { logger } from '@/utils/logger';
import { getAdvisorByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    logger.info('Token doğrulama isteği alındı');

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      logger.error('Geçersiz token formatı');
      return NextResponse.json(
        { error: 'Geçersiz token formatı' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const body = await request.json();

    if (!body.email || !body.role) {
      logger.error('Eksik kullanıcı bilgileri:', body);
      return NextResponse.json(
        { error: 'Eksik kullanıcı bilgileri' },
        { status: 400 }
      );
    }

    logger.info('Token doğrulanıyor:', { email: body.email, role: body.role });

    // Token'ı doğrula
    const decoded = verifyToken(token);
    if (!decoded) {
      logger.error('Token doğrulama hatası');
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    logger.info('Token başarıyla doğrulandı:', decoded);

    // Token bilgileri ile istek bilgilerini karşılaştır
    if (decoded.email !== body.email || decoded.role !== body.role) {
      logger.error('Token bilgileri eşleşmiyor:', {
        token: decoded,
        request: body
      });
      return NextResponse.json(
        { error: 'Token bilgileri eşleşmiyor' },
        { status: 401 }
      );
    }

    // Danışman rolü için ek doğrulama
    if (body.role === 'advisor') {
      const advisor = await getAdvisorByEmail(body.email);
      if (!advisor) {
        logger.error('Danışman bulunamadı:', body.email);
        return NextResponse.json(
          { error: 'Danışman bulunamadı' },
          { status: 401 }
        );
      }
    }

    logger.info('Oturum doğrulandı:', body.email);
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    logger.error('Token doğrulama hatası:', error);
    return NextResponse.json(
      { error: 'Token doğrulama hatası' },
      { status: 500 }
    );
  }
} 