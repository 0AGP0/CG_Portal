import { NextRequest, NextResponse } from 'next/server';
import { startProcessAndAssignAdvisor } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await request.json();
    
    // Gerekli alanlar mevcut mu kontrol et
    if (!body.studentId || !body.advisorId) {
      return NextResponse.json(
        { error: 'Öğrenci ID ve Danışman ID alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Öğrenciye danışman ata
    // Not: startProcessAndAssignAdvisor fonksiyonu öğrenci e-postası, danışman ID'si ve satış ekibi üyesi ID'si gerektirir
    // Burada satış ekibi üyesi ID'si yerine 'admin' kullanıyoruz
    const updatedStudent = await startProcessAndAssignAdvisor(
      body.studentId, // studentId değerini email olarak kullanıyoruz
      body.advisorId,
      'admin-user'
    );
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Danışman atama işlemi başarısız oldu' },
        { status: 500 }
      );
    }
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: 'Danışman başarıyla atandı',
      student: {
        id: updatedStudent.email,
        email: updatedStudent.email,
        name: updatedStudent.name,
        advisor: updatedStudent.advisorName,
        advisorId: updatedStudent.advisorId,
        status: updatedStudent.stage || 'Beklemede',
        processStarted: updatedStudent.processStarted || false,
        updatedAt: updatedStudent.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Danışman atama hatası:', error);
    return NextResponse.json(
      { error: 'Danışman atama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 