import { NextRequest, NextResponse } from 'next/server';
import { updateOrCreateRecord, getRecordByEmail } from '@/utils/database';
import { logWebhook, logError } from '@/utils/logger';

// Webhook secret sabit değeri (gerçek projede .env'den alınmalıdır)
const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    let secretParam = url.searchParams.get('secret') || '';
    
    // Odoo'dan gelen veri formatına uygun olarak email bilgisini çıkartalım
    const email = body.email || body.x_studio_mail_adresi || null;
    
    logWebhook('odoo-webhook', 'success', { 
      email: email, 
      name: body.name, 
      action: body._action,
      stage: body.x_studio_selection_field_8en_1iqnrqang
    });
    
    // URL'deki secret parametresini kontrol et - sabit değer kullanıyoruz
    // Odoo'dan gelen secret değerinde URL'nin tamamı olabiliyor, bu yüzden temizleyelim
    if (secretParam.includes(WEBHOOK_SECRET)) {
      // Secret değer içeriyorsa kabul et
      secretParam = WEBHOOK_SECRET;
    }
    
    if (secretParam !== WEBHOOK_SECRET) {
      logError('Geçersiz webhook secret parametresi', { secretParam, expectedSecret: WEBHOOK_SECRET });
      return NextResponse.json({ error: 'Geçersiz güvenlik anahtarı' }, { status: 401 });
    }
    
    // Gerekli alanların varlığını kontrol et
    if (!email) {
      logError('Email bilgisi eksik', body);
      return NextResponse.json({ error: 'Email bilgisi bulunamadı' }, { status: 400 });
    }
    
    // Önce portalda bu email ile kayıtlı bir öğrenci var mı kontrol et
    const existingStudent = await getRecordByEmail(email);
    if (!existingStudent) {
      logError('Eşleşen öğrenci bulunamadı', { email });
      return NextResponse.json({ 
        error: 'Bu email adresi ile portalda kayıtlı öğrenci bulunamadı',
        email: email
      }, { status: 404 });
    }
    
    // Genişletilmiş Odoo verilerini işleme
    const customerData = {
      email: email,
      lead_id: body.id || body._id,
      name: body.name,
      contact_address: body.contact_address,
      phone: body.phone,
      
      // Yaş bilgisi
      age: body.x_studio_ya,
      
      // Pasaport bilgileri
      passport_number: body.x_studio_pasaport_numaras,
      passport_type: body.x_studio_pasaport_tr,
      passport_issue_date: body.x_studio_verili_tarihi,
      passport_expiry_date: body.x_studio_geerlilik_tarihi,
      issuing_authority: body.x_studio_veren_makam,
      pnr_number: body.x_studio_pnr_numaras,
      
      // Vize bilgileri
      visa_application_date: body.x_studio_vize_bavuru_tarihi_1,
      visa_appointment_date: body.x_studio_vize_randevu_tarihi,
      visa_document: body.x_studio_vize_randevu_belgesi,
      consulate: body.x_studio_konsolosluk_1,
      has_been_to_germany: body.x_studio_almanya_bulunma,
      
      // Lise bilgileri
      high_school_name: body.x_studio_lise_ad,
      high_school_type: body.x_studio_lise_tr,
      high_school_city: body.x_studio_lise_ehir,
      high_school_start_date: body.x_studio_lise_balang_tarihi_1,
      high_school_graduation_date: body.x_studio_lise_biti_tarihi,
      
      // Üniversite bilgileri
      university_name: body.x_studio_niversite_ad,
      university_department: body.x_studio_niversite_blm_ad,
      university_start_date: body.x_studio_niversite_balang_tarihi,
      university_end_date: body.x_studio_niversite_biti_tarihi,
      graduation_status: body.x_studio_mezuniyet_durumu,
      graduation_year: body.x_studio_mezuniyet_yl,
      university_preferences: body.x_studio_niversite_tercihleri,
      german_department_preference: body.x_studio_de_blm_tercihi,
      
      // Dil bilgileri
      language_level: body.x_studio_almanca_seviyesi_1,
      language_certificate: body.x_studio_almanca_sertifikas,
      language_course_registration: body.x_studio_dil_kursu_kayt,
      language_learning_status: body.x_studio_dil_renim_durumu,
      
      // Kişisel bilgiler
      birth_date: body.x_studio_doum_tarihi,
      birth_place: body.x_studio_doum_yeri,
      marital_status: body.x_studio_medeni_durum_1,
      
      // Finansal bilgiler
      financial_proof: body.x_studio_finansal_kant,
      financial_proof_status: body.x_studio_maddi_kant_durumu,
      
      // Sınav bilgileri
      exam_entry: body.x_studio_sym_snav_giri,
      exam_result_date: body.x_studio_sym_yerlestirme_sonuc_tarihi,
      
      // Aile bilgileri
      mother_name: body.x_studio_anne_ad,
      mother_surname: body.x_studio_anne_soyad,
      mother_birth_date: body.x_studio_anne_doum_tarihi,
      mother_birth_place: body.x_studio_anne_doum_yeri,
      mother_residence: body.x_studio_anne_ikamet_sehrilke,
      mother_phone: body.x_studio_anne_telefon,
      
      father_name: body.x_studio_baba_ad,
      father_surname: body.x_studio_baba_soyad,
      father_birth_date: body.x_studio_baba_doum_tarihi,
      father_birth_place: body.x_studio_baba_doum_yeri,
      father_residence: body.x_studio_baba_ikamet_ehrilkesi,
      father_phone: body.x_studio_baba_telefon,
      
      // Öğrenci aşaması (Odoo'dan gelen durum bilgisi) - önemli güncelleme
      stage: body.x_studio_selection_field_8en_1iqnrqang || existingStudent.stage || 'yeni',
      
      // Eski alanları da koru
      university: body.x_studio_niversite_ad || existingStudent.university,
      program: body.x_studio_niversite_blm_ad || existingStudent.program,
      
      // Webhook ile güncelleme bayrağı
      webhook_updated: true,
      webhook_update_timestamp: new Date().toISOString()
    };
    
    // Veriyi depola - mevcut öğrenciyi güncelle
    const result = await updateOrCreateRecord(customerData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Öğrenci bilgileri başarıyla güncellendi', 
      student: {
        email: result.email,
        name: result.name,
        stage: result.stage
      }
    }, { status: 200 });
  } catch (error) {
    logError('Webhook işleme hatası', error);
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 });
  }
} 