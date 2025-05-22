import { NextRequest, NextResponse } from 'next/server';
import { loadAdvisorsDb } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // Danışman veritabanını yükle
    const advisorsDb = await loadAdvisorsDb();
    
    // Danışman verilerini formatlayarak döndür
    const advisors = advisorsDb.advisors.map(advisor => ({
      id: advisor.id,
      name: advisor.name,
      email: advisor.email,
      studentCount: advisor.studentIds?.length || 0,
      updatedAt: advisor.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      advisors
    });
  } catch (error) {
    console.error('Admin danışman listesi hatası:', error);
    
    // Hata durumunda örnek veri döndür
    const mockAdvisors = [
      {
        id: "adv-1",
        name: "Müge Hanım", 
        email: "muge@campusglobal.com",
        studentCount: 8,
        updatedAt: "2023-05-10T14:30:00Z"
      },
      {
        id: "adv-2",
        name: "Murat Bey",
        email: "murat@campusglobal.com",
        studentCount: 12,
        updatedAt: "2023-06-15T09:45:00Z"
      },
      {
        id: "adv-3", 
        name: "Canan Hanım",
        email: "canan@campusglobal.com",
        studentCount: 5,
        updatedAt: "2023-04-20T11:20:00Z"
      }
    ];
    
    return NextResponse.json({
      success: true,
      advisors: mockAdvisors,
      fromMock: true
    });
  }
}

// POST isteği - Yeni danışman oluştur
export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini al
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
    
    // Gerçek uygulamada burada veritabanına ekleme yapılır
    // Şimdilik mock olarak yanıt döndürelim
    
    const newAdvisor = {
      id: `adv-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      studentIds: [],
      studentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Yanıt olarak oluşturulan danışmanı döndür
    return NextResponse.json({
      success: true,
      advisor: {
        id: newAdvisor.id,
        name: newAdvisor.name,
        email: newAdvisor.email,
        phone: newAdvisor.phone || '',
        studentCount: 0,
        createdAt: newAdvisor.createdAt,
        updatedAt: newAdvisor.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Danışman oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Danışman oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 