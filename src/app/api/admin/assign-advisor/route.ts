import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
    
    // customers.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Öğrenciyi bul
    const studentIndex = data.customers.findIndex((s: any) => s.email === body.studentId);
    if (studentIndex === -1) {
      return NextResponse.json(
        { error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }
    
    // Danışman bilgilerini al (gerçek uygulamada danışman veritabanından alınır)
    const advisor = {
      id: body.advisorId,
      name: "Emre Danışman", // Gerçek uygulamada danışman veritabanından alınır
      email: "emre.danisman@example.com" // Gerçek uygulamada danışman veritabanından alınır
    };
    
    // Öğrenci bilgilerini güncelle
    const updatedStudent = {
      ...data.customers[studentIndex],
      advisorId: advisor.id,
      advisorName: advisor.name,
      advisorEmail: advisor.email,
      stage: 'Süreç Başlatıldı',
      processStarted: true,
      processStartDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Güncellenmiş öğrenciyi kaydet
    data.customers[studentIndex] = updatedStudent;
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
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
        status: updatedStudent.stage,
        processStarted: updatedStudent.processStarted,
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