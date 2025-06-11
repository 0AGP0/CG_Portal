import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';
import { generateToken } from '@/utils/security';

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
    
    // Danışmanı veritabanından getir
    const advisor = await getAdvisorByEmail(body.email);
    
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

    // Token oluştur
    const token = generateToken({
      id: advisor.id.toString(),
      email: advisor.email,
      role: 'advisor'
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
        id: advisor.id,
        email: advisor.email,
        name: advisor.name,
        role: 'advisor',
        studentIds: advisor.studentIds || []
      }
    };

    logger.info('Danışman girişi başarılı:', { email: advisor.email });
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error('Danışman girişi hatası:', error);
    return NextResponse.json(
      { error: 'Danışman girişi yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 