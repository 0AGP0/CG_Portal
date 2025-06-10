import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    // Email parametresini decode et
    const email = decodeURIComponent(params.email);

    // customers.json dosyasını oku
    const filePath = path.join(process.cwd(), 'data', 'customers.json');
    
    // Dosya varlığını kontrol et
    if (!fs.existsSync(filePath)) {
      console.error('Veritabanı dosyası bulunamadı:', filePath);
      return NextResponse.json(
        { success: false, error: 'Öğrenci veritabanı bulunamadı' },
        { status: 404 }
      );
    }

    // Dosyayı oku
    let data;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      console.error('Veritabanı okuma hatası:', error);
      return NextResponse.json(
        { success: false, error: 'Veritabanı okunamadı' },
        { status: 500 }
      );
    }

    // Öğrenciyi bul
    const student = data.customers?.find((c: any) => 
      c.email.toLowerCase() === email.toLowerCase()
    );

    if (!student) {
      console.log('Öğrenci bulunamadı:', email);
      return NextResponse.json(
        { success: false, error: 'Öğrenci bulunamadı' },
        { status: 404 }
      );
    }

    // Danışman bilgisini ekle
    if (student.advisorEmail) {
      const advisorsPath = path.join(process.cwd(), 'data', 'advisors.json');
      if (fs.existsSync(advisorsPath)) {
        try {
          const advisorsContent = fs.readFileSync(advisorsPath, 'utf-8');
          const advisorsData = JSON.parse(advisorsContent);
          const advisor = advisorsData.advisors?.find((a: any) => 
            a.email.toLowerCase() === student.advisorEmail.toLowerCase()
          );
          
          if (advisor) {
            student.advisor = {
              id: advisor.id,
              name: advisor.name,
              email: advisor.email
            };
          }
        } catch (error) {
          console.error('Danışman bilgisi okuma hatası:', error);
          // Danışman bilgisi okunamazsa öğrenci bilgisini yine de döndür
        }
      }
    }

    console.log('Öğrenci bulundu:', email);
    return NextResponse.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Öğrenci getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Öğrenci bilgisi alınamadı' },
      { status: 500 }
    );
  }
} 