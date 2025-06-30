import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { logger } from '@/utils/logger';

// Webhook secret sabit değeri
const WEBHOOK_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// Odoo alanlarını veritabanı alanlarına eşleyen mapping
const FIELD_MAPPING = {
  // Temel bilgiler
  name: 'name',
  phone: 'phone',
  contact_address: 'contact_address',
  x_studio_mail_adresi: 'email',
  
  // Durum bilgisi
  x_studio_selection_field_8en_1iqnrqang: 'stage',
  stage: 'stage',
  
  // Kişisel Bilgiler
  x_studio_doum_tarihi: 'birth_date',
  x_studio_doum_yeri: 'birth_place',
  x_studio_ya: 'age',
  x_studio_medeni_durum_1: 'marital_status',
  x_studio_finansal_kant: 'financial_proof',
  
  // Pasaport Bilgileri
  x_studio_pasaport_numaras: 'passport_number',
  x_studio_pasaport_tr: 'passport_type',
  x_studio_verili_tarihi: 'passport_issue_date',
  x_studio_geerlilik_tarihi: 'passport_expiry_date',
  x_studio_veren_makam: 'issuing_authority',
  x_studio_pnr_numaras: 'pnr_number',
  
  // Aile Bilgileri
  x_studio_anne_ad: 'mother_name',
  x_studio_anne_soyad: 'mother_surname',
  x_studio_anne_doum_tarihi: 'mother_birth_date',
  x_studio_anne_doum_yeri: 'mother_birth_place',
  x_studio_anne_ikamet_sehrilke: 'mother_residence',
  x_studio_anne_telefon: 'mother_phone',
  
  x_studio_baba_ad: 'father_name',
  x_studio_baba_soyad: 'father_surname',
  x_studio_baba_doum_tarihi: 'father_birth_date',
  x_studio_baba_doum_yeri: 'father_birth_place',
  x_studio_baba_ikamet_ehrilkesi: 'father_residence',
  x_studio_baba_telefon: 'father_phone',
  
  // Eğitim Bilgileri
  x_studio_lise_ad: 'high_school_name',
  x_studio_lise_tr: 'high_school_type',
  x_studio_lise_ehir: 'high_school_city',
  x_studio_lise_biti_tarihi: 'high_school_graduation_date',
  x_studio_lise_balang_tarihi_1: 'high_school_start_date',
  
  x_studio_niversite_ad: 'university_name',
  x_studio_niversite_blm_ad: 'university_department',
  x_studio_niversite_balang_tarihi: 'university_start_date',
  x_studio_niversite_biti_tarihi: 'university_end_date',
  x_studio_mezuniyet_durumu: 'graduation_status',
  x_studio_mezuniyet_yl: 'graduation_year',
  
  // Dil Bilgileri
  x_studio_almanca_seviyesi_1: 'language_level',
  x_studio_almanca_sertifikas: 'language_certificate',
  x_studio_dil_renim_durumu: 'language_learning_status',
  
  // Sınav ve Vize Bilgileri
  x_studio_sym_snav_giri: 'exam_entry',
  x_studio_sym_yerlestirme_sonuc_tarihi: 'exam_result_date',
  x_studio_vize_randevu_tarihi: 'visa_appointment_date',
  x_studio_vize_bavuru_tarihi_1: 'visa_application_date',
  x_studio_konsolosluk_1: 'visa_consulate',
  x_studio_vize_randevu_belgesi: 'visa_document',
  
  // Diğer Bilgiler
  x_studio_almanya_bulunma: 'has_been_to_germany',
  x_studio_de_blm_tercihi: 'german_department_preference',
  x_studio_niversite_tercihleri: 'university_preferences',
  x_studio_maddi_kant_durumu: 'financial_proof_status',
  x_studio_bilgiler_1: 'additional_info'
};

// Değerleri temizleyen yardımcı fonksiyon
function cleanValue(value: any): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // String değerleri trim et
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  
  return value;
}

// Dinamik UPDATE sorgusu oluşturan fonksiyon
function buildUpdateQuery(fieldsToUpdate: Record<string, any>): { query: string, values: any[] } {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  // updated_at her zaman güncellenir
  setClauses.push('updated_at = NOW()');
  
  // process_started her zaman true olarak ayarlanır
  setClauses.push('process_started = true');
  
  // Diğer alanları ekle
  for (const [field, value] of Object.entries(fieldsToUpdate)) {
    if (value !== null && value !== undefined) {
      setClauses.push(`${field} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }
  
  const query = `
    UPDATE students 
    SET ${setClauses.join(', ')}
    WHERE email = $${paramIndex}
    RETURNING *
  `;
  
  return { query, values };
}

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

    // Veritabanı bağlantısı
    const client = await pool.connect();
    
    try {
      // Öğrenci kontrolü - doğrudan veritabanı sorgusu
      console.log('\nÖğrenci kontrolü yapılıyor...');
      const checkQuery = 'SELECT * FROM students WHERE email = $1';
      const checkResult = await client.query(checkQuery, [email]);
      
      if (checkResult.rows.length === 0) {
        console.error('❌ Bu email adresiyle kayıtlı öğrenci bulunamadı:', email);
        return NextResponse.json({
          error: 'Student not found',
          message: 'Bu email adresiyle kayıtlı öğrenci bulunamadı',
          email: email
        }, { status: 404 });
      }
      
      const existingStudent = checkResult.rows[0];
      console.log('✅ Öğrenci bulundu:', existingStudent.name);

      // Güncellenecek alanları hazırla
      console.log('\nGüncellenecek alanlar hazırlanıyor...');
      const fieldsToUpdate: Record<string, any> = {};
      
      // FIELD_MAPPING kullanarak alanları eşle
      for (const [odooField, dbField] of Object.entries(FIELD_MAPPING)) {
        if (body.hasOwnProperty(odooField)) {
          const cleanedValue = cleanValue(body[odooField]);
          if (cleanedValue !== null) {
            fieldsToUpdate[dbField] = cleanedValue;
            console.log(`📝 ${odooField} -> ${dbField}: ${cleanedValue}`);
          }
        }
      }
      
      // Özel durum kontrolü - stage alanı
      const stage = body.x_studio_selection_field_8en_1iqnrqang || body.stage || '';
      if (stage) {
        fieldsToUpdate.stage = stage;
        console.log(`📝 Stage güncelleniyor: ${stage}`);
      }

      console.log('\nGüncellenecek alanlar:', Object.keys(fieldsToUpdate));
      console.log('Güncellenecek değerler:', fieldsToUpdate);

      // Dinamik UPDATE sorgusu oluştur
      const { query: updateQuery, values: updateValues } = buildUpdateQuery(fieldsToUpdate);
      
      // Email'i values array'ine ekle
      updateValues.push(email);
      
      console.log('\nSQL Sorgusu:', updateQuery);
      console.log('Parametreler:', updateValues);
      
      // Güncelleme işlemini gerçekleştir
      const updateResult = await client.query(updateQuery, updateValues);
      const updatedStudent = updateResult.rows[0];

      console.log('\n✅ Öğrenci başarıyla güncellendi');
      console.log('Güncellenen alan sayısı:', Object.keys(fieldsToUpdate).length);
      console.log('Güncellenen öğrenci:', JSON.stringify(updatedStudent, null, 2));

      return NextResponse.json({
        success: true,
        message: 'Öğrenci bilgileri güncellendi',
        updatedFields: Object.keys(fieldsToUpdate),
        student: updatedStudent
      }, { status: 200 });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('\n❌ Webhook işleme hatası:', error);
    logger.error('Webhook error', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    console.log('\n=== WEBHOOK İSTEĞİ TAMAMLANDI ===\n');
  }
} 