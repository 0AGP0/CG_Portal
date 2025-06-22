import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, getRecordByEmail } from '@/utils/database';
import { logInfo, logError } from '@/utils/logger';

// Odoo API bilgileri
const ODOO_API_URL = process.env.ODOO_API_URL || 'https://your-odoo-instance.com/api';
const ODOO_API_KEY = process.env.ODOO_API_KEY || 'default-key'; 

export async function GET(request: NextRequest) {
  try {
    // URL'den e-posta parametresini al (isteğe bağlı)
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const secretParam = url.searchParams.get('secret') || '';
    
    // API güvenliği için basit bir kontrol
    const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    if (secretParam !== WEBHOOK_SECRET) {
      logError('Geçersiz API secret parametresi', { secretParam });
      return NextResponse.json({ error: 'Geçersiz güvenlik anahtarı' }, { status: 401 });
    }
    
    // Gerçek bir Odoo API'ye bağlanacak olsaydık, burada Odoo'ya istek yapardık
    // Şimdilik test verisi ile devam ediyoruz
    
    // Test verileri - gerçek uygulamada bu veri Odoo API'den gelecek
    const testData = {
      email: email || "burcu.shut@gmail.com",  // eğer email parametresi yoksa varsayılan email
      name: "AKİLE BURCU ŞAT",
      contact_address: "İstanbul",
      stage: "BİTEN",  // Odoo'daki güncel durum
      passport_number: "U30684829",
      visa_appointment_date: "2024-07-16",
      // ... diğer veriler
    };
    
    // Eğer bir email parametresi verilmişse, sadece o kaydı kontrol et ve güncelle
    if (email) {
      logInfo(`Odoo'dan ${email} için veri çekiliyor`);
      const existingStudent = await getRecordByEmail(email);
      
      if (!existingStudent) {
        return NextResponse.json({ 
          error: 'Belirtilen email ile öğrenci bulunamadı',
          email: email
        }, { status: 404 });
      }
      
      // Öğrenciyi güncelle
      const result = await updateOrCreateRecord({
        email: email,
        stage: testData.stage,
        updatedAt: new Date().toISOString(),
        webhook_updated: true,
        webhook_update_timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Öğrenci bilgileri Odoo\'dan çekildi ve güncellendi',
        student: result
      });
    }
    
    // Eğer email parametresi verilmemişse, tüm öğrencileri Odoo'dan çek ve güncelle
    // Gerçek uygulamada burada tüm öğrencileri alıp güncelleyecek kod olacak
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bu endpoint, Odoo\'dan veri çekmek için kullanılacak. Belirli bir öğrenciyi güncellemek için ?email=örnek@mail.com parametresini kullanın.'
    });
    
  } catch (error) {
    logError('Odoo veri çekme hatası', error);
    return NextResponse.json({ error: 'Veri çekme işlemi sırasında hata oluştu' }, { status: 500 });
  }
} 