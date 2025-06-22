import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Danışmanları veritabanından getir
      const query = `
        SELECT 
          id,
          name,
          email,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM students WHERE advisor_email = advisors.email) as student_count
        FROM advisors
        ORDER BY updated_at DESC
      `;
      
      const result = await client.query(query);
      const advisors = result.rows.map(advisor => ({
        id: advisor.id,
        name: advisor.name,
        email: advisor.email,
        studentCount: parseInt(advisor.student_count) || 0,
        updatedAt: advisor.updated_at
      }));
      
      return NextResponse.json({
        success: true,
        advisors
      });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Admin danışman listesi hatası:', error);
    return NextResponse.json(
      { error: 'Danışman listesi alınamadı' },
      { status: 500 }
    );
  }
}

// POST isteği - Yeni danışman oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gerekli alanlar mevcut mu kontrol et
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Ad ve e-posta alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    try {
      // E-posta adresi kullanımda mı kontrol et
      const checkQuery = 'SELECT id FROM advisors WHERE email = $1';
      const checkResult = await client.query(checkQuery, [body.email]);
      
      if (checkResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanımda' },
          { status: 400 }
        );
      }
      
      // Yeni danışmanı ekle
      const insertQuery = `
        INSERT INTO advisors (name, email, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id, name, email, created_at, updated_at
      `;
      
      const insertResult = await client.query(insertQuery, [
        body.name,
        body.email
      ]);
      
      const newAdvisor = insertResult.rows[0];
      
      return NextResponse.json({
        success: true,
        advisor: {
          id: newAdvisor.id,
          name: newAdvisor.name,
          email: newAdvisor.email,
          studentCount: 0,
          createdAt: newAdvisor.created_at,
          updatedAt: newAdvisor.updated_at
        }
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Danışman oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Danışman oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 