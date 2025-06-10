import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getRecordByEmail } from '@/utils/database';
import { logError } from '@/utils/logger';

// Vize başvuru bilgilerini kontrol eden yardımcı fonksiyon
function checkVisaApplicationFields(student: any) {
  const missingFields = [];
  
  // Danışan İletişim Bilgileri
  if (!student.contact_address) missingFields.push('İletişim Adresi');
  if (!student.x_studio_medeni_durum_1) missingFields.push('Medeni Durum');
  if (!student.phone) missingFields.push('İletişim Numarası');
  if (!student.email) missingFields.push('Mail Adresi');
  
  // Baba Bilgileri
  if (!student.x_studio_baba_ad) missingFields.push('Baba Adı');
  if (!student.x_studio_baba_soyad) missingFields.push('Baba Soyadı');
  if (!student.x_studio_baba_doum_tarihi) missingFields.push('Baba Doğum Tarihi');
  if (!student.x_studio_baba_doum_yeri) missingFields.push('Baba Doğum Yeri');
  if (!student.x_studio_baba_ikamet_ehrilkesi) missingFields.push('Baba İkamet Şehri/İlçesi');
  
  // Anne Bilgileri
  if (!student.x_studio_anne_ad) missingFields.push('Anne Adı');
  if (!student.x_studio_anne_soyad) missingFields.push('Anne Soyadı');
  if (!student.x_studio_anne_doum_tarihi) missingFields.push('Anne Doğum Tarihi');
  if (!student.x_studio_anne_doum_yeri) missingFields.push('Anne Doğum Yeri');
  if (!student.x_studio_anne_ikamet_sehrilke) missingFields.push('Anne İkamet Şehri/İlçesi');
  
  // Evli ise Eş Bilgileri (Medeni durum kontrolü eklenecek)
  if (student.x_studio_medeni_durum_1 === 'Evli') {
    if (!student.x_studio_es_ad_soyad) missingFields.push('Eş Adı Soyadı');
    if (!student.x_studio_es_klk_soyad) missingFields.push('Eş Kızlık Soyadı');
    if (!student.x_studio_es_doum_tarihi) missingFields.push('Eş Doğum Tarihi');
    if (!student.x_studio_es_doum_yeri) missingFields.push('Eş Doğum Yeri');
    if (!student.x_studio_es_ikamet) missingFields.push('Eş İkamet Şehri/İlçesi');
  }
  
  // Çocuk Bilgileri (18 yaş altı)
  if (student.x_studio_cocuk_var_m) {
    if (!student.x_studio_cocuk_ad_soyad) missingFields.push('Çocuk Adı Soyadı');
    if (!student.x_studio_cocuk_doum_tarihi) missingFields.push('Çocuk Doğum Tarihi');
    if (!student.x_studio_cocuk_doum_yeri) missingFields.push('Çocuk Doğum Yeri');
    if (!student.x_studio_cocuk_vatandaslik) missingFields.push('Çocuk Vatandaşlık Bilgileri');
    if (!student.x_studio_cocuk_ikamet) missingFields.push('Çocuk İkamet Şehri/İlçesi');
  }
  
  // Almanya'da Bulunma Bilgileri
  if (student.x_studio_almanya_bulunma === 'Evet') {
    if (!student.x_studio_almanya_bulunma_tarihleri) missingFields.push('Almanya\'da Bulunma Tarihleri');
    if (!student.x_studio_almanya_bulunma_sehir) missingFields.push('Almanya\'da Bulunulan Şehir');
  }
  
  return missingFields;
}

export async function GET(request: NextRequest) {
  try {
    // Öğrencinin email bilgisini al
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      console.error('Kullanıcı email bilgisi bulunamadı');
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bilgisi bulunamadı' }, 
        { status: 401 }
      );
    }
    
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
      c.email.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (!student) {
      console.error('Öğrenci bulunamadı:', userEmail);
      return NextResponse.json(
        { success: false, error: 'Öğrenci kaydı bulunamadı' }, 
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
    
    // Aşama durumunu belirle
    let stageStatus = 'İşlemde';
    let stagePercentage = 40;
    let stageMessage = '';
    
    if (student.stage === 'BİTEN') {
      stageStatus = 'Tamamlandı';
      stagePercentage = 100;
      stageMessage = 'Başvuru süreciniz tamamlandı!';
    } else if (student.stage === 'İşlemde') {
      stageStatus = 'Devam Ediyor';
      stagePercentage = 50;
      stageMessage = 'Başvuru süreciniz devam ediyor';
    } else if (student.stage === 'Süreç Başlatıldı') {
      stageStatus = 'Başlangıç';
      stagePercentage = 30;
      stageMessage = 'Süreciniz başlatıldı, dökümanları tamamlayın';
    }
    
    // Bildirim oluştur
    const alerts = [];
    
    if (student.webhook_updated) {
      const updateDate = student.webhook_update_timestamp ? new Date(student.webhook_update_timestamp).toLocaleDateString('tr-TR') : 'yakın zamanda';
      alerts.push({
        id: 1,
        type: 'success',
        message: `Bilgileriniz ${updateDate} tarihinde güncellendi. Durumunuz: ${student.stage}`
      });
    } else {
      alerts.push({
        id: 1, 
        type: 'warning', 
        message: 'Profilinizi tamamlamanız gerekiyor.'
      });
    }
    
    // Vize başvuru aşaması kontrolü ve bildirim oluşturma
    if (student.stage === 'Vize Başvuru') {
      const missingFields = checkVisaApplicationFields(student);
      
      if (missingFields.length > 0) {
        alerts.push({
          id: 2,
          type: 'warning',
          message: `Vize başvurunuz için aşağıdaki bilgileri tamamlamanız gerekmektedir: ${missingFields.join(', ')}`,
          details: 'Lütfen kişisel bilgiler panelinden eksik bilgilerinizi güncelleyiniz.'
        });
      }
    }

    console.log('Öğrenci profili başarıyla getirildi:', userEmail);
    
    // Öğrenci profil bilgilerini formatla ve döndür
    return NextResponse.json({
      success: true,
      student: {
        // Temel bilgiler
        name: student.name,
        email: student.email,
        studentId: student.lead_id || 'Henüz Oluşturulmadı',
        processStarted: student.processStarted || false,
        counselor: student.advisor?.name || student.advisorName || 'Henüz Atanmadı',
        counselorEmail: student.advisor?.email || student.advisorEmail || null,
        salesPerson: student.salesName || 'Henüz Atanmadı',
        salesEmail: student.salesEmail || null,
        lastLogin: new Date().toLocaleDateString('tr-TR'),
        
        // Sistem bilgileri
        systemDetails: {
          stage: student.stage || 'Yeni',
          stageStatus,
          stagePercentage,
          lastUpdated: student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('tr-TR') : null,
          isUpdated: student.webhook_updated || false,
          lastUpdateTime: student.webhook_update_timestamp ? new Date(student.webhook_update_timestamp).toLocaleDateString('tr-TR') : null
        },
        
        // Odoo'dan gelen tüm alanlar
        x_studio_mail_adresi: student.x_studio_mail_adresi,
        x_studio_doum_tarihi: student.x_studio_doum_tarihi,
        x_studio_doum_yeri: student.x_studio_doum_yeri,
        x_studio_ya: student.x_studio_ya,
        x_studio_medeni_durum_1: student.x_studio_medeni_durum_1,
        x_studio_finansal_kant: student.x_studio_finansal_kant,
        
        // Anne bilgileri
        x_studio_anne_ad: student.x_studio_anne_ad,
        x_studio_anne_soyad: student.x_studio_anne_soyad,
        x_studio_anne_doum_tarihi: student.x_studio_anne_doum_tarihi,
        x_studio_anne_doum_yeri: student.x_studio_anne_doum_yeri,
        x_studio_anne_ikamet_sehrilke: student.x_studio_anne_ikamet_sehrilke,
        x_studio_anne_telefon: student.x_studio_anne_telefon,
        
        // Baba bilgileri
        x_studio_baba_ad: student.x_studio_baba_ad,
        x_studio_baba_soyad: student.x_studio_baba_soyad,
        x_studio_baba_doum_tarihi: student.x_studio_baba_doum_tarihi,
        x_studio_baba_doum_yeri: student.x_studio_baba_doum_yeri,
        x_studio_baba_ikamet_ehrilkesi: student.x_studio_baba_ikamet_ehrilkesi,
        x_studio_baba_telefon: student.x_studio_baba_telefon,
        
        // Pasaport bilgileri
        x_studio_pasaport_numaras: student.x_studio_pasaport_numaras,
        x_studio_pasaport_tr: student.x_studio_pasaport_tr,
        x_studio_verili_tarihi: student.x_studio_verili_tarihi,
        x_studio_geerlilik_tarihi: student.x_studio_geerlilik_tarihi,
        x_studio_veren_makam: student.x_studio_veren_makam,
        x_studio_pnr_numaras: student.x_studio_pnr_numaras,
        
        // Lise bilgileri
        x_studio_lise_ad: student.x_studio_lise_ad,
        x_studio_lise_tr: student.x_studio_lise_tr,
        x_studio_lise_ehir: student.x_studio_lise_ehir,
        x_studio_lise_balang_tarihi_1: student.x_studio_lise_balang_tarihi_1,
        x_studio_lise_biti_tarihi: student.x_studio_lise_biti_tarihi,
        
        // Üniversite bilgileri
        x_studio_niversite_ad: student.x_studio_niversite_ad,
        x_studio_niversite_blm_ad: student.x_studio_niversite_blm_ad,
        x_studio_niversite_balang_tarihi: student.x_studio_niversite_balang_tarihi,
        x_studio_niversite_biti_tarihi: student.x_studio_niversite_biti_tarihi,
        x_studio_mezuniyet_durumu: student.x_studio_mezuniyet_durumu,
        x_studio_mezuniyet_yl: student.x_studio_mezuniyet_yl,
        
        // Dil bilgileri
        x_studio_almanca_seviyesi_1: student.x_studio_almanca_seviyesi_1,
        x_studio_almanca_sertifikas: student.x_studio_almanca_sertifikas,
        x_studio_dil_kursu_kayt: student.x_studio_dil_kursu_kayt,
        x_studio_dil_renim_durumu: student.x_studio_dil_renim_durumu,
        
        // Sınav ve vize bilgileri
        x_studio_sym_snav_giri: student.x_studio_sym_snav_giri,
        x_studio_sym_yerlestirme_sonuc_tarihi: student.x_studio_sym_yerlestirme_sonuc_tarihi,
        x_studio_vize_randevu_tarihi: student.x_studio_vize_randevu_tarihi,
        x_studio_vize_bavuru_tarihi_1: student.x_studio_vize_bavuru_tarihi_1,
        x_studio_konsolosluk_1: student.x_studio_konsolosluk_1,
        x_studio_vize_randevu_belgesi: student.x_studio_vize_randevu_belgesi,
        
        // Diğer bilgiler
        x_studio_almanya_bulunma: student.x_studio_almanya_bulunma,
        x_studio_de_blm_tercihi: student.x_studio_de_blm_tercihi,
        x_studio_niversite_tercihleri: student.x_studio_niversite_tercihleri,
        x_studio_maddi_kant_durumu: student.x_studio_maddi_kant_durumu,
        x_studio_bilgiler_1: student.x_studio_bilgiler_1,
        
        // İletişim bilgileri
        phone: student.phone,
        contact_address: student.contact_address,
        
        // Vize başvuru bilgileri
        x_studio_es_ad_soyad: student.x_studio_es_ad_soyad,
        x_studio_es_klk_soyad: student.x_studio_es_klk_soyad,
        x_studio_es_doum_tarihi: student.x_studio_es_doum_tarihi,
        x_studio_es_doum_yeri: student.x_studio_es_doum_yeri,
        x_studio_es_ikamet: student.x_studio_es_ikamet,
        
        x_studio_cocuk_var_m: student.x_studio_cocuk_var_m,
        x_studio_cocuk_ad_soyad: student.x_studio_cocuk_ad_soyad,
        x_studio_cocuk_doum_tarihi: student.x_studio_cocuk_doum_tarihi,
        x_studio_cocuk_doum_yeri: student.x_studio_cocuk_doum_yeri,
        x_studio_cocuk_vatandaslik: student.x_studio_cocuk_vatandaslik,
        x_studio_cocuk_ikamet: student.x_studio_cocuk_ikamet,
        
        x_studio_almanya_bulunma_tarihleri: student.x_studio_almanya_bulunma_tarihleri,
        x_studio_almanya_bulunma_sehir: student.x_studio_almanya_bulunma_sehir,
        
        // Uyarılar
        alerts
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Profil bilgileri alınamadı' },
      { status: 500 }
    );
  }
} 