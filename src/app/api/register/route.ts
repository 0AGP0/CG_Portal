import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, assignSalesPersonToStudent } from '@/utils/database';
import { logError } from '@/utils/logger';

// Danışman bilgileri için interface
interface AdvisorRecord {
  id: string;
  email: string;
  name: string;
  studentIds: string[];
  updatedAt: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Email ve isim alanları zorunludur' }, 
        { status: 400 }
      );
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz' }, 
        { status: 400 }
      );
    }
    
    // Kullanıcı kaydını oluştur veya güncelle
    const customerData = {
      email: body.email,
      name: body.name,
      phone: body.phone || null,
      // İlk kayıt için varsayılan değerler
      stage: 'new',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      processStarted: false,
      // Danışman bilgileri satış ekibi tarafından daha sonra atanacak
      advisorId: null,
      advisorName: null,
      advisorEmail: null,
      salesId: null,
      salesName: null,
      salesEmail: null
    };
    
    console.log("Kullanıcı verisi hazırlandı:", customerData);
    
    const result = await updateOrCreateRecord(customerData);
    console.log("Kullanıcı kaydı başarılı:", result);
    
    // Kaydedilen kullanıcıya otomatik olarak satış ekibi üyesi atama
    const assignedSalesPerson = await assignSalesPersonToStudent(body.email);
    console.log("Satış ekibi üyesi atama sonucu:", assignedSalesPerson ? 
      `${assignedSalesPerson.name} (${assignedSalesPerson.email})` : 
      'Atama yapılamadı');
    
    // Öğrenci verisini güncelle
    if (assignedSalesPerson) {
      await updateOrCreateRecord({
        email: body.email,
        salesId: assignedSalesPerson.id,
        salesName: assignedSalesPerson.name,
        salesEmail: assignedSalesPerson.email
      });
      
      console.log("Öğrenci satış ekibi bilgisiyle güncellendi");
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Kullanıcı kaydı başarıyla oluşturuldu',
        user: { 
          email: result.email,
          name: result.name,
          salesName: assignedSalesPerson?.name || 'Henüz atanmadı'
        }
      }, 
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error("Kullanıcı kaydı detaylı hata:", error);
    console.error("Hata mesajı:", error.message);
    console.error("Hata stack:", error.stack);
    
    logError('Kullanıcı kaydı hatası', error);
    return NextResponse.json(
      { error: 'Kullanıcı kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') }, 
      { status: 500 }
    );
  }
} 