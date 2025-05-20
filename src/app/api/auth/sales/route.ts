import { NextRequest, NextResponse } from 'next/server';
import { getSalesPersonByEmail } from '@/utils/database';
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
    
    // Satış ekibi üyesini e-posta adresine göre bul
    const salesPerson = await getSalesPersonByEmail(body.email);
    
    if (!salesPerson) {
      return NextResponse.json(
        { error: 'Satış ekibi üyesi bulunamadı' }, 
        { status: 404 }
      );
    }
    
    // Gerçek uygulamada burada şifre kontrolü, kimlik doğrulama 
    // ve yetkilendirme işlemleri yapılır
    
    // Basitleştirilmiş şifre kontrolü (gerçek uygulamada daha güvenli olmalı)
    // Demo amaçlı olarak şimdilik herhangi bir şifreyi kabul ediyoruz
    
    // Başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        salesPerson: {
          id: salesPerson.id,
          name: salesPerson.name,
          email: salesPerson.email,
          studentIds: salesPerson.studentIds || []
        }
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Satış ekibi girişi hatası', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 