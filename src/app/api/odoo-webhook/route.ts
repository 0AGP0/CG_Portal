import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, getRecordByEmail } from '@/utils/database';
import { logError, logInfo } from '@/utils/logger';

// Webhook secret sabit değeri
const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export async function POST(request: NextRequest) {
  console.log('\n=== WEBHOOK İSTEĞİ BAŞLADI ===');
  console.log('Zaman:', new Date().toISOString());
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  
  // Tüm headers'ları logla
  const headers = Object.fromEntries(request.headers.entries());
  console.log('Headers:', JSON.stringify(headers, null, 2));

  try {
    // URL'den secret parametresini al
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret') || '';
    console.log('\nSecret Kontrolü:');
    console.log('- Alınan:', secretParam.substring(0, 10) + '...');
    console.log('- Beklenen:', WEBHOOK_SECRET.substring(0, 10) + '...');

    // Secret kontrolü
    if (secretParam !== WEBHOOK_SECRET) {
      console.error('❌ Geçersiz webhook secret');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret' },
        { status: 401 }
      );
    }
    console.log('✅ Secret doğrulandı');

    // Request body'yi al
    const rawBody = await request.text();
    console.log('\nHam Veri:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('\nİşlenmiş Veri:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('❌ JSON parse hatası:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const email = body.x_studio_mail_adresi || body.email || null;
    console.log('\nEmail Kontrolü:', email);
    
    if (!email) {
      console.error('❌ Email alanı bulunamadı');
      return NextResponse.json(
        { error: 'Email field is required' },
        { status: 400 }
      );
    }
    console.log('✅ Email doğrulandı');

    // Öğrenci kontrolü
    console.log('\nÖğrenci kontrolü yapılıyor...');
    const existingStudent = await getRecordByEmail(email);
    
    if (!existingStudent) {
      console.error('❌ Bu email adresiyle kayıtlı öğrenci bulunamadı:', email);
      return NextResponse.json({
        error: 'Student not found',
        message: 'Bu email adresiyle kayıtlı öğrenci bulunamadı',
        email: email
      }, { status: 404 });
    }
    console.log('✅ Öğrenci bulundu:', existingStudent.name);

    // Durum kontrolü
    const stage = body.x_studio_selection_field_8en_1iqnrqang || body.stage || '';
    console.log('\nDurum Kontrolü:', stage);

    // Öğrenci verisini güncelle
    console.log('\nÖğrenci güncelleniyor...');
    const updatedStudent = await updateOrCreateRecord({
      email: email,
      name: body.name || existingStudent.name,
      phone: body.phone || existingStudent.phone,
      contact_address: body.contact_address || existingStudent.contact_address,
      stage: stage,
      processStarted: true,
      updatedAt: new Date().toISOString(),
      webhook_updated: true,
      webhook_update_timestamp: new Date().toISOString(),
      
      // Kişisel Bilgiler
      x_studio_doum_tarihi: body.x_studio_doum_tarihi || existingStudent.x_studio_doum_tarihi,
      x_studio_doum_yeri: body.x_studio_doum_yeri || existingStudent.x_studio_doum_yeri,
      x_studio_ya: body.x_studio_ya || existingStudent.x_studio_ya,
      x_studio_medeni_durum_1: body.x_studio_medeni_durum_1 || existingStudent.x_studio_medeni_durum_1,
      x_studio_finansal_kant: body.x_studio_finansal_kant || existingStudent.x_studio_finansal_kant,
      
      // Pasaport Bilgileri
      x_studio_pasaport_numaras: body.x_studio_pasaport_numaras || existingStudent.x_studio_pasaport_numaras,
      x_studio_pasaport_tr: body.x_studio_pasaport_tr || existingStudent.x_studio_pasaport_tr,
      x_studio_verili_tarihi: body.x_studio_verili_tarihi || existingStudent.x_studio_verili_tarihi,
      x_studio_geerlilik_tarihi: body.x_studio_geerlilik_tarihi || existingStudent.x_studio_geerlilik_tarihi,
      x_studio_veren_makam: body.x_studio_veren_makam || existingStudent.x_studio_veren_makam,
      x_studio_pnr_numaras: body.x_studio_pnr_numaras || existingStudent.x_studio_pnr_numaras,
      
      // Aile Bilgileri
      x_studio_anne_ad: body.x_studio_anne_ad || existingStudent.x_studio_anne_ad,
      x_studio_anne_soyad: body.x_studio_anne_soyad || existingStudent.x_studio_anne_soyad,
      x_studio_anne_doum_tarihi: body.x_studio_anne_doum_tarihi || existingStudent.x_studio_anne_doum_tarihi,
      x_studio_anne_doum_yeri: body.x_studio_anne_doum_yeri || existingStudent.x_studio_anne_doum_yeri,
      x_studio_anne_ikamet_sehrilke: body.x_studio_anne_ikamet_sehrilke || existingStudent.x_studio_anne_ikamet_sehrilke,
      x_studio_anne_telefon: body.x_studio_anne_telefon || existingStudent.x_studio_anne_telefon,
      
      x_studio_baba_ad: body.x_studio_baba_ad || existingStudent.x_studio_baba_ad,
      x_studio_baba_soyad: body.x_studio_baba_soyad || existingStudent.x_studio_baba_soyad,
      x_studio_baba_doum_tarihi: body.x_studio_baba_doum_tarihi || existingStudent.x_studio_baba_doum_tarihi,
      x_studio_baba_doum_yeri: body.x_studio_baba_doum_yeri || existingStudent.x_studio_baba_doum_yeri,
      x_studio_baba_ikamet_ehrilkesi: body.x_studio_baba_ikamet_ehrilkesi || existingStudent.x_studio_baba_ikamet_ehrilkesi,
      x_studio_baba_telefon: body.x_studio_baba_telefon || existingStudent.x_studio_baba_telefon,
      
      // Eğitim Bilgileri
      x_studio_lise_ad: body.x_studio_lise_ad || existingStudent.x_studio_lise_ad,
      x_studio_lise_tr: body.x_studio_lise_tr || existingStudent.x_studio_lise_tr,
      x_studio_lise_ehir: body.x_studio_lise_ehir || existingStudent.x_studio_lise_ehir,
      x_studio_lise_biti_tarihi: body.x_studio_lise_biti_tarihi || existingStudent.x_studio_lise_biti_tarihi,
      x_studio_lise_balang_tarihi_1: body.x_studio_lise_balang_tarihi_1 || existingStudent.x_studio_lise_balang_tarihi_1,
      
      x_studio_niversite_ad: body.x_studio_niversite_ad || existingStudent.x_studio_niversite_ad,
      x_studio_niversite_blm_ad: body.x_studio_niversite_blm_ad || existingStudent.x_studio_niversite_blm_ad,
      x_studio_niversite_balang_tarihi: body.x_studio_niversite_balang_tarihi || existingStudent.x_studio_niversite_balang_tarihi,
      x_studio_niversite_biti_tarihi: body.x_studio_niversite_biti_tarihi || existingStudent.x_studio_niversite_biti_tarihi,
      x_studio_mezuniyet_durumu: body.x_studio_mezuniyet_durumu || existingStudent.x_studio_mezuniyet_durumu,
      x_studio_mezuniyet_yl: body.x_studio_mezuniyet_yl || existingStudent.x_studio_mezuniyet_yl,
      
      // Dil Bilgileri
      x_studio_almanca_seviyesi_1: body.x_studio_almanca_seviyesi_1 || existingStudent.x_studio_almanca_seviyesi_1,
      x_studio_almanca_sertifikas: body.x_studio_almanca_sertifikas || existingStudent.x_studio_almanca_sertifikas,
      x_studio_dil_kursu_kayt: body.x_studio_dil_kursu_kayt || existingStudent.x_studio_dil_kursu_kayt,
      x_studio_dil_renim_durumu: body.x_studio_dil_renim_durumu || existingStudent.x_studio_dil_renim_durumu,
      
      // Sınav ve Vize Bilgileri
      x_studio_sym_snav_giri: body.x_studio_sym_snav_giri || existingStudent.x_studio_sym_snav_giri,
      x_studio_sym_yerlestirme_sonuc_tarihi: body.x_studio_sym_yerlestirme_sonuc_tarihi || existingStudent.x_studio_sym_yerlestirme_sonuc_tarihi,
      x_studio_vize_randevu_tarihi: body.x_studio_vize_randevu_tarihi || existingStudent.x_studio_vize_randevu_tarihi,
      x_studio_vize_bavuru_tarihi_1: body.x_studio_vize_bavuru_tarihi_1 || existingStudent.x_studio_vize_bavuru_tarihi_1,
      x_studio_konsolosluk_1: body.x_studio_konsolosluk_1 || existingStudent.x_studio_konsolosluk_1,
      x_studio_vize_randevu_belgesi: body.x_studio_vize_randevu_belgesi || existingStudent.x_studio_vize_randevu_belgesi,
      
      // Diğer Bilgiler
      x_studio_almanya_bulunma: body.x_studio_almanya_bulunma || existingStudent.x_studio_almanya_bulunma,
      x_studio_de_blm_tercihi: body.x_studio_de_blm_tercihi || existingStudent.x_studio_de_blm_tercihi,
      x_studio_niversite_tercihleri: body.x_studio_niversite_tercihleri || existingStudent.x_studio_niversite_tercihleri,
      x_studio_maddi_kant_durumu: body.x_studio_maddi_kant_durumu || existingStudent.x_studio_maddi_kant_durumu,
      x_studio_bilgiler_1: body.x_studio_bilgiler_1 || existingStudent.x_studio_bilgiler_1,
      
      // Eş Bilgileri
      x_studio_es_ad_soyad: body.x_studio_es_ad_soyad || existingStudent.x_studio_es_ad_soyad,
      x_studio_es_klk_soyad: body.x_studio_es_klk_soyad || existingStudent.x_studio_es_klk_soyad,
      x_studio_es_doum_tarihi: body.x_studio_es_doum_tarihi || existingStudent.x_studio_es_doum_tarihi,
      x_studio_es_doum_yeri: body.x_studio_es_doum_yeri || existingStudent.x_studio_es_doum_yeri,
      x_studio_es_ikamet: body.x_studio_es_ikamet || existingStudent.x_studio_es_ikamet,
      
      // Çocuk Bilgileri
      x_studio_cocuk_var_m: body.x_studio_cocuk_var_m || existingStudent.x_studio_cocuk_var_m,
      x_studio_cocuk_ad_soyad: body.x_studio_cocuk_ad_soyad || existingStudent.x_studio_cocuk_ad_soyad,
      x_studio_cocuk_doum_tarihi: body.x_studio_cocuk_doum_tarihi || existingStudent.x_studio_cocuk_doum_tarihi,
      x_studio_cocuk_doum_yeri: body.x_studio_cocuk_doum_yeri || existingStudent.x_studio_cocuk_doum_yeri,
      x_studio_cocuk_vatandaslik: body.x_studio_cocuk_vatandaslik || existingStudent.x_studio_cocuk_vatandaslik,
      x_studio_cocuk_ikamet: body.x_studio_cocuk_ikamet || existingStudent.x_studio_cocuk_ikamet,
      
      // Almanya'da Bulunma Bilgileri
      x_studio_almanya_bulunma_tarihleri: body.x_studio_almanya_bulunma_tarihleri || existingStudent.x_studio_almanya_bulunma_tarihleri,
      x_studio_almanya_bulunma_sehir: body.x_studio_almanya_bulunma_sehir || existingStudent.x_studio_almanya_bulunma_sehir,
    });

    console.log('\n✅ Öğrenci başarıyla güncellendi:', JSON.stringify(updatedStudent, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Öğrenci bilgileri güncellendi',
      student: updatedStudent
    }, { status: 200 });

  } catch (error: any) {
    console.error('\n❌ Webhook işleme hatası:', error);
    logError('Webhook error', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    console.log('\n=== WEBHOOK İSTEĞİ TAMAMLANDI ===\n');
  }
} 