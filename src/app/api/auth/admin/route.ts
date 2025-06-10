import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/utils/logger';

// Demo admin hesapları
const DEMO_ADMINS = [
  {
    id: 'admin-1',
    email: 'admin@campusglobal.com',
    name: 'Admin User',
    role: 'admin'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('Admin girişi isteği alındı'); // Debug log
    
    const body = await request.json();
    console.log('Gelen veri:', body); // Debug log
    
    // E-posta kontrolü
    if (!body.email) {
      console.log('E-posta eksik'); // Debug log
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Admin'i e-posta adresine göre bul
    const admin = DEMO_ADMINS.find(a => a.email === body.email);
    console.log('Bulunan admin:', admin); // Debug log
    
    if (!admin) {
      // Admin bulunamadıysa yeni kayıt oluştur
      console.log('Admin bulunamadı, yeni kayıt oluşturuluyor'); // Debug log
      const newAdmin = {
        id: `admin-${Date.now()}`,
        email: body.email,
        name: body.email.split('@')[0].split('.').map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ') || 'Yeni Admin',
        role: 'admin'
      };
      
      // Başarılı giriş
      return NextResponse.json(
        { 
          success: true, 
          message: 'Giriş başarılı',
          user: newAdmin
        }, 
        { status: 200 }
      );
    }
    
    // Başarılı giriş
    return NextResponse.json(
      { 
        success: true, 
        message: 'Giriş başarılı',
        user: admin
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    logError('Admin girişi hatası', error);
    console.error('Admin girişi detaylı hata:', error); // Debug log
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 