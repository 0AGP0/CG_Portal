import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail } from '@/utils/database';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.role) {
      logger.error('Eksik parametreler:', body);
      return NextResponse.json(
        { error: 'E-posta ve rol bilgisi gerekli' },
        { status: 400 }
      );
    }

    // Danışman rolü için doğrulama
    if (body.role === 'advisor') {
      const advisor = await getAdvisorByEmail(body.email);
      if (!advisor) {
        logger.error('Danışman bulunamadı:', body.email);
        return NextResponse.json(
          { error: 'Geçersiz danışman bilgisi' },
          { status: 401 }
        );
      }
    }

    // Başarılı doğrulama
    logger.info('Oturum doğrulandı:', body.email);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Oturum doğrulama hatası:', error);
    return NextResponse.json(
      { error: 'Oturum doğrulanamadı' },
      { status: 500 }
    );
  }
} 