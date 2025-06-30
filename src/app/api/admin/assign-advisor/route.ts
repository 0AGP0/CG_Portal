import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    
    // Gerekli alanlar mevcut mu kontrol et
    if (!body.studentEmail || !body.advisorEmail) {
      return NextResponse.json(
        { error: 'Öğrenci e-posta ve Danışman e-posta alanları zorunludur' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      // Öğrenciyi ve danışmanı kontrol et
      const checkQuery = `
        SELECT 
          s.id as student_id,
          s.email as student_email,
          s.name as student_name,
          a.id as advisor_id,
          a.email as advisor_email,
          a.name as advisor_name
        FROM students s
        CROSS JOIN advisors a
        WHERE s.email = $1 AND a.email = $2
      `;
      
      const checkResult = await client.query(checkQuery, [body.studentEmail, body.advisorEmail]);
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Öğrenci veya danışman bulunamadı' },
          { status: 404 }
        );
      }
      
      const { student_id, student_email, student_name, advisor_id, advisor_email, advisor_name } = checkResult.rows[0];
      
      // Öğrencinin danışmanını güncelle
      const updateQuery = `
        UPDATE students
        SET 
          advisor_email = $1,
          advisor_id = $2,
          stage = 'Hazırlık Aşaması',
          process_started = true,
          process_start_date = NOW(),
          updated_at = NOW()
        WHERE email = $3
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [
        advisor_email,
        advisor_id,
        student_email
      ]);
      
      const updatedStudent = updateResult.rows[0];
      
      // Başarılı yanıt döndür
      return NextResponse.json({
        success: true,
        message: 'Danışman başarıyla atandı',
        student: {
          id: updatedStudent.id,
          email: updatedStudent.email,
          name: updatedStudent.name,
          advisor: advisor_name,
          advisorId: advisor_id,
          advisorEmail: advisor_email,
          status: updatedStudent.stage,
          processStarted: updatedStudent.process_started,
          updatedAt: updatedStudent.updated_at
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Danışman atama hatası:', error);
    return NextResponse.json(
      { error: 'Danışman atama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 