import { NextRequest, NextResponse } from 'next/server';
import { startProcessAndAssignAdvisor, getSalesPersonByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Satış ekibi üyesinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
    // Satış ekibi üyesini kontrol et
    const salesPerson = await getSalesPersonByEmail(userEmail);
    
    if (!salesPerson) {
      return NextResponse.json(
        { error: 'Satış ekibi üyesi bulunamadı' }, 
        { status: 403 }
      );
    }
    
    // Request body'den gerekli bilgileri al
    const body = await request.json();
    const { studentEmail, advisorId, salesPersonId } = body;
    
    if (!studentEmail || !advisorId) {
      return NextResponse.json(
        { error: "Öğrenci e-posta adresi ve danışman ID'si gereklidir" }, 
        { status: 400 }
      );
    }
    
    // Satış ekibi üyesi ID'si belirtilmemişse, giriş yapan kullanıcının ID'sini kullan
    const useSalesPersonId = salesPersonId || salesPerson.id;
    
    // Süreci başlat ve danışman ata
    const updatedStudent = await startProcessAndAssignAdvisor(
      studentEmail, 
      advisorId, 
      useSalesPersonId
    );
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Süreç başlatma ve danışman atama işlemi başarısız oldu' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Süreç başarıyla başlatıldı ve danışman atandı',
        studentEmail,
        advisorId,
        salesPersonId: useSalesPersonId
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Süreç başlatma hatası:', error);
    logError('Süreç başlatma ve danışman atama hatası', error);
    
    return NextResponse.json(
      { error: 'Süreç başlatma sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 