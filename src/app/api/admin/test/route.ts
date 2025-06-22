import { NextRequest, NextResponse } from 'next/server';
import { createStudent } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Test öğrencisi ekleme isteği alındı');
    
    const testStudent = {
      email: 'test@campusglobal.com',
      name: 'Test Öğrenci',
      phone: '5551234567',
      stage: 'Hazırlık Aşaması',
      process_started: false
    };

    const newStudent = await createStudent(testStudent);
    
    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.email,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        advisor: newStudent.advisor_name || 'Atanmadı',
        status: newStudent.stage,
        processStarted: newStudent.process_started,
        createdAt: newStudent.created_at,
        updatedAt: newStudent.updated_at
      }
    }, { status: 201 });
  } catch (error) {
    logger.error('Test öğrencisi ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Test öğrencisi eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 