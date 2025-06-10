import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Danışman öğrenci listesi isteği alındı');
    
    // Kullanıcı e-postasını header'dan al
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      logger.error('Kullanıcı e-postası bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    
    logger.info('Danışman öğrenci listesi getiriliyor', { userEmail });

    // advisors.json dosyasını oku
    const advisorsPath = path.join(process.cwd(), 'data', 'advisors.json');
    if (!fs.existsSync(advisorsPath)) {
      logger.error('Danışman veritabanı bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Danışman veritabanı bulunamadı' },
        { status: 404 }
      );
    }

    // Danışmanı bul
    const advisorsContent = fs.readFileSync(advisorsPath, 'utf-8');
    const advisorsData = JSON.parse(advisorsContent);
    const advisor = advisorsData.advisors?.find((a: any) => 
      a.email.toLowerCase() === userEmail.toLowerCase()
    );

    if (!advisor) {
      logger.error('Danışman bulunamadı:', userEmail);
      return NextResponse.json(
        { success: false, error: 'Danışman bulunamadı' },
        { status: 404 }
      );
    }

    // customers.json dosyasını oku
    const customersPath = path.join(process.cwd(), 'data', 'customers.json');
    if (!fs.existsSync(customersPath)) {
      logger.info('Öğrenci veritabanı bulunamadı, boş liste döndürülüyor');
      return NextResponse.json({
        success: true,
        students: []
      });
    }

    // Öğrencileri filtrele
    const customersContent = fs.readFileSync(customersPath, 'utf-8');
    const customersData = JSON.parse(customersContent);
    
    // Danışmanın öğrencilerini filtrele
    const students = customersData.customers?.filter((student: any) => 
      student.advisorEmail?.toLowerCase() === userEmail.toLowerCase()
    ).map((student: any) => ({
      id: student.lead_id || student.email,
      name: student.name,
      email: student.email,
      stage: student.stage || 'YENI',
      university: student.university,
      program: student.program,
      phone: student.phone,
      updatedAt: student.updatedAt,
      processStarted: student.processStarted,
      processStartDate: student.processStartDate,
      documents: student.documents || []
    })) || [];

    logger.info('Öğrenci listesi başarıyla getirildi', { 
      advisorEmail: userEmail, 
      studentCount: students.length 
    });
    
    return NextResponse.json({
      success: true,
      students
    });
    
  } catch (error) {
    logger.error('Öğrenci listesi getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci listesi alınamadı' },
      { status: 500 }
    );
  }
} 