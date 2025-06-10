import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET isteği - Tüm öğrencileri getir
export async function GET(request: NextRequest) {
  try {
    // customers.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Öğrenci verilerini formatla
    const students = data.customers.map((student: any) => {
      // Türkçe karakterleri düzelt
      const status = student.stage || 'Beklemede';
      const advisor = student.advisorName || 'Atanmadı';
      
      return {
        id: student.email, // email'i id olarak kullan
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        advisor: advisor,
        status: status,
        processStarted: student.processStarted || false,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        advisorId: student.advisorId,
        advisorEmail: student.advisorEmail,
        salesId: student.salesId,
        salesName: student.salesName,
        salesEmail: student.salesEmail,
        documents: student.documents || []
      };
    });
    
    // Response header'larını ayarla
    const headers = new Headers();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return new NextResponse(
      JSON.stringify({
      success: true,
        students
      }, null, 2),
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Admin öğrenci listesi hatası:', error);
    return NextResponse.json(
      { error: 'Öğrenci listesi alınırken bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
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
    
    // customers.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Yeni öğrenciyi oluştur
    const newStudent = {
      email: body.email,
      name: body.name,
      phone: body.phone || '',
      stage: 'new',
      processStarted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      advisorId: null,
      advisorName: null,
      advisorEmail: null,
      salesId: 'admin-user',
      salesName: 'Admin',
      salesEmail: 'admin@campusglobal.com',
      documents: []
    };
    
    // Öğrenciyi listeye ekle
    data.customers.push(newStudent);
    
    // Dosyaya kaydet
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    // Yanıt olarak oluşturulan öğrenciyi döndür
    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.email,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        advisor: newStudent.advisorName || 'Atanmadı',
        status: newStudent.stage,
        processStarted: newStudent.processStarted,
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