import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // E-posta ve şifre kontrolü
    if (!body.email) {
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    if (!body.password) {
      return NextResponse.json(
        { error: 'Şifre gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Danışmanı e-posta adresine göre bul
    const advisor = await getAdvisorByEmail(body.email);
    
    if (!advisor) {
      return NextResponse.json(
        { error: 'Danışman bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Gerçek uygulamada burada şifre kontrolü, kimlik doğrulama 
    // ve yetkilendirme işlemleri yapılır
    
    // Basitleştirilmiş şifre kontrolü (gerçek uygulamada daha güvenli olmalı)
    // Test şifresi: "password123" - gerçek uygulamada asla açık metin şifre kullanmayın
    // Demo amaçlı olarak şimdilik herhangi bir şifreyi kabul ediyoruz
    
    // Başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        advisor: {
          id: advisor.id,
          name: advisor.name,
          email: advisor.email,
          studentIds: advisor.studentIds || []
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Danışman girişi hatası', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 