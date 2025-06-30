import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

// PUT isteği - Öğrenci güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    const body = await request.json();
    
    logger.info('Öğrenci güncelleme isteği:', { email, body });
    
    // Gerekli alanlar mevcut mu kontrol et
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Ad ve e-posta alanları zorunludur' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      // Öğrenciyi güncelle
      const updateQuery = `
        UPDATE students
        SET 
          name = $1,
          phone = $2,
          stage = $3,
          updated_at = NOW()
        WHERE email = $4
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [
        body.name,
        body.phone || '',
        body.stage || 'Hazırlık Aşaması',
        email
      ]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Öğrenci bulunamadı' },
          { status: 404 }
        );
      }
      
      const updatedStudent = result.rows[0];
      
      // Danışman bilgisini al
      const advisorQuery = `
        SELECT name FROM advisors WHERE email = $1
      `;
      const advisorResult = await client.query(advisorQuery, [updatedStudent.advisor_email]);
      const advisorName = advisorResult.rows.length > 0 ? advisorResult.rows[0].name : 'Atanmadı';
      
      return NextResponse.json({
        success: true,
        student: {
          id: updatedStudent.email,
          name: updatedStudent.name,
          email: updatedStudent.email,
          phone: updatedStudent.phone,
          advisor: advisorName,
          status: updatedStudent.stage,
          processStarted: updatedStudent.process_started,
          createdAt: updatedStudent.created_at,
          updatedAt: updatedStudent.updated_at
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Öğrenci güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci güncellenirken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// GET isteği - Öğrenci detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);
    
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM students WHERE email = $1
      `;
      
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Öğrenci bulunamadı' },
          { status: 404 }
        );
      }
      
      const student = result.rows[0];
      
      return NextResponse.json({
        success: true,
        student: {
          id: student.email,
          name: student.name,
          email: student.email,
          phone: student.phone,
          advisor: student.advisor_email,
          status: student.stage,
          processStarted: student.process_started,
          createdAt: student.created_at,
          updatedAt: student.updated_at
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Öğrenci detay hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci detayları alınırken bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 