import { NextRequest, NextResponse } from 'next/server';
import { getStudentByEmail, updateStudentProfile } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    logger.info('Öğrenci bilgisi isteği alındı:', decodedEmail);

    const student = await getStudentByEmail(decodedEmail);
    
    if (!student) {
      logger.error('Öğrenci bulunamadı:', decodedEmail);
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    logger.info('Öğrenci bilgileri başarıyla getirildi:', decodedEmail);
    return NextResponse.json({
      success: true,
      student
    });

    } catch (error) {
    logger.error('Öğrenci bilgisi getirme hatası:', error);
      return NextResponse.json(
      { error: 'Öğrenci bilgisi alınamadı' },
        { status: 500 }
      );
    }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ email: string }> }
) {
        try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const body = await request.json();
    
    logger.info('Öğrenci güncelleme isteği alındı:', decodedEmail);

    const updatedStudent = await updateStudentProfile(decodedEmail, body);
    
    logger.info('Öğrenci bilgileri başarıyla güncellendi:', decodedEmail);
    return NextResponse.json({
      success: true,
      student: updatedStudent
    });

  } catch (error) {
    logger.error('Öğrenci güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci güncellenemedi' },
      { status: 500 }
    );
  }
} 