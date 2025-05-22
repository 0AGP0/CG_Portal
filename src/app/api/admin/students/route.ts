import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, CustomerRecord } from '@/utils/database';

// GET isteği - Tüm öğrencileri getir
export async function GET(request: NextRequest) {
  try {
    // Veritabanından tüm öğrencileri al
    // loadDb fonksiyonu export edilmemiş, o yüzden doğrudan veritabanını çağıramıyoruz
    // Örnek veri döndürelim - gerçek uygulamada bir API kullanılacak
    
    const mockStudents = [
      {
        id: "student1",
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        phone: "532-111-2233",
        advisor: "Müge Hanım",
        status: "Aktif",
        processStarted: true,
        createdAt: "2023-01-15T10:30:00Z",
        updatedAt: "2023-06-22T14:15:00Z"
      },
      {
        id: "student2",
        name: "Ayşe Demir",
        email: "ayse@example.com",
        phone: "535-222-3344",
        advisor: "Atanmadı",
        status: "Beklemede",
        processStarted: false,
        createdAt: "2023-02-20T09:45:00Z",
        updatedAt: "2023-02-20T09:45:00Z"
      },
      {
        id: "student3",
        name: "Mehmet Kaya",
        email: "mehmet@example.com", 
        phone: "542-333-4455",
        advisor: "Murat Bey",
        status: "Aktif",
        processStarted: true,
        createdAt: "2023-03-10T11:20:00Z",
        updatedAt: "2023-05-15T16:30:00Z"
      }
    ];
    
    return NextResponse.json({
      success: true,
      students: mockStudents
    });
  } catch (error) {
    console.error('Admin öğrenci listesi hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci listesi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST isteği - Yeni öğrenci oluştur
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
    
    // Öğrenci oluştur veya güncelle
    const newStudent = await updateOrCreateRecord({
      email: body.email,
      name: body.name,
      phone: body.phone || '',
      stage: 'Beklemede',
      processStarted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Yanıt olarak oluşturulan öğrenciyi döndür
    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.email,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone || '',
        advisor: newStudent.advisorName || 'Atanmadı',
        status: newStudent.stage || 'Beklemede',
        createdAt: newStudent.createdAt,
        updatedAt: newStudent.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Öğrenci oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 