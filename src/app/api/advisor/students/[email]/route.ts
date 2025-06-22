import { NextRequest, NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await context.params;
    const decodedEmail = decodeURIComponent(email);
    logger.info('Danışman öğrenci detayı isteği alındı:', decodedEmail);

    const student = await getStudentByEmail(decodedEmail);
    
    if (!student) {
      logger.error('Öğrenci bulunamadı:', decodedEmail);
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    logger.info('Öğrenci detayları başarıyla getirildi:', decodedEmail);
    return NextResponse.json({
      success: true,
      student
    });

  } catch (error) {
    logger.error('Öğrenci detayı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci detayı alınamadı' },
      { status: 500 }
    );
  }
} 