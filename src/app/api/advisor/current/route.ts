import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail, getRecordByEmail } from '@/utils/database';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Öğrenci e-postasını header'dan al
    const studentEmail = request.headers.get('x-user-email');
    if (!studentEmail) {
      logger.error('Öğrenci e-postası bulunamadı');
      return NextResponse.json(
        { error: 'Öğrenci e-postası gerekli' },
        { status: 400 }
      );
    }

    // Öğrenci kaydını bul
    const student = await getRecordByEmail(studentEmail);
    if (!student) {
      logger.error('Öğrenci bulunamadı:', studentEmail);
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    // Öğrencinin danışman e-postasını al
    const advisorEmail = student.advisorEmail;
    if (!advisorEmail) {
      logger.error('Öğrencinin danışmanı atanmamış:', studentEmail);
      return NextResponse.json(
        { error: 'Öğrencinin danışmanı atanmamış' },
        { status: 404 }
      );
    }

    // Danışman bilgilerini getir
    const advisor = await getAdvisorByEmail(advisorEmail);
    if (!advisor) {
      logger.error('Danışman bulunamadı:', advisorEmail);
      return NextResponse.json(
        { error: 'Danışman bulunamadı' },
        { status: 404 }
      );
    }

    // Danışman bilgilerini döndür
    return NextResponse.json({
      success: true,
      advisor: {
        id: advisor.id,
        name: advisor.name,
        email: advisor.email
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