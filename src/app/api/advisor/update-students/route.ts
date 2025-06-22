import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail, updateOrCreateAdvisor } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gerekli parametreleri kontrol et
    if (!body.advisorId || !body.studentEmail) {
      return NextResponse.json({ 
        error: 'Danışman ID ve öğrenci email bilgileri gereklidir' 
      }, { 
        status: 400 
      });
    }
    
    // Danışmanı ID'ye göre bul (burada email ile arama fonksiyonunu kullanıyoruz,
    // gerçek uygulamada ID'ye göre arama yapılmalıdır)
    const advisorsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/advisor/list`);
    const advisorsData = await advisorsResponse.json();
    
    const advisor = advisorsData.advisors.find((adv: any) => adv.id === body.advisorId);
    
    if (!advisor) {
      return NextResponse.json({ 
        error: 'Danışman bulunamadı' 
      }, { 
        status: 404 
      });
    }
    
    // Öğrenciyi danışmanın listesine ekle (eğer zaten yoksa)
    if (!advisor.studentIds) {
      advisor.studentIds = [];
    }
    
    // Email adresi zaten listede var mı kontrol et
    const studentEmail = body.studentEmail.toLowerCase();
    if (!advisor.studentIds.includes(studentEmail)) {
      advisor.studentIds.push(studentEmail);
    }
    
    // Danışman bilgilerini güncelle
    const updatedAdvisor = await updateOrCreateAdvisor({
      id: advisor.id,
      email: advisor.email,
      name: advisor.name,
      studentIds: advisor.studentIds,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Öğrenci danışmana başarıyla eklendi',
      advisor: {
        id: updatedAdvisor.id,
        name: updatedAdvisor.name,
        email: updatedAdvisor.email,
        studentCount: updatedAdvisor.studentIds.length
      }
    });
    
  } catch (error) {
    logError('Danışman öğrenci güncelleme hatası', error);
    return NextResponse.json({ 
      error: 'Danışman öğrenci listesi güncellenirken bir hata oluştu' 
    }, { 
      status: 500 
    });
  }
} 